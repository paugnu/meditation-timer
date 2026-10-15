package expo.modules.meditationaudio

import android.os.Handler
import android.os.Looper
import androidx.annotation.OptIn
import androidx.media3.common.C
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import expo.modules.audio.AudioPlayer
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.max
import kotlin.math.min

private const val FADE_MS = 1500L
private const val STEP_MS = 50L

/** Native ownership keeps the opening hold, fades and absolute stop working without JS. */
@OptIn(UnstableApi::class)
private class AmbienceTarget(private val audio: AudioPlayer, private val handler: Handler) {
  private var target = 0f
  private var initial = 0f
  private var startsAt = 0L
  private var endsAt: Long? = null
  private var removed = false
  private val update = Runnable { step() }
  private val listener = object : Player.Listener {
    override fun onPlayWhenReadyChanged(playWhenReady: Boolean, reason: Int) {
      if (playWhenReady && !canPlay()) stop()
    }
    override fun onIsPlayingChanged(isPlaying: Boolean) {
      if (isPlaying && !canPlay()) stop()
    }
  }

  init {
    audio.ref.addListener(listener)
    // The wake lock exists only while ExoPlayer is playing, including a muted opening hold.
    audio.ref.setWakeMode(C.WAKE_MODE_LOCAL)
  }

  fun setTarget(volume: Double, holdUntil: Double, deadline: Double?) {
    handler.removeCallbacks(update)
    target = if (volume.isFinite()) volume.coerceIn(0.0, 1.0).toFloat() else 0f
    endsAt = deadline?.takeIf { it.isFinite() }?.toLong()
    if (endsAt == null) target = 0f
    initial = audio.ref.volume
    val now = System.currentTimeMillis()
    startsAt = if (target > 0 && holdUntil.isFinite()) max(now, holdUntil.toLong()) else now
    step()
  }

  private fun canPlay() = !removed && target > 0f && (endsAt ?: 0L) > System.currentTimeMillis()

  private fun stop() {
    audio.ref.volume = 0f
    audio.ref.pause()
    audio.setActiveForLockScreen(false)
  }

  private fun step() {
    if (removed) return
    val now = System.currentTimeMillis()
    if (endsAt != null && now >= endsAt!!) {
      stop()
      return  // Retain the listener: a stale system play command must remain silent.
    }
    val remaining = endsAt?.minus(now)
    val progress = ((now - startsAt).toDouble() / FADE_MS).coerceIn(0.0, 1.0).toFloat()
    val envelope = remaining?.let { (it.toDouble() / FADE_MS).coerceIn(0.0, 1.0).toFloat() } ?: 1f
    audio.ref.volume = (initial + (target - initial) * progress) * envelope
    if (progress >= 1f && target == 0f) {
      stop()
      return
    }
    val moving = progress < 1f && initial != target
    val ending = remaining != null && remaining <= FADE_MS
    var wait = if ((moving && now >= startsAt) || ending) STEP_MS else 1000L
    if (now < startsAt) wait = min(wait, startsAt - now)
    if (remaining != null && remaining > FADE_MS) wait = min(wait, remaining - FADE_MS)
    endsAt?.let { wait = min(wait, it - now) }
    handler.postDelayed(update, max(1L, wait))
  }

  fun remove() {
    removed = true
    handler.removeCallbacks(update)
    audio.ref.removeListener(listener)
    stop()
  }
}

@OptIn(UnstableApi::class)
class MeditationAudioModule : Module() {
  private val handler = Handler(Looper.getMainLooper())
  private val targets = mutableMapOf<String, AmbienceTarget>()
  override fun definition() = ModuleDefinition {
    Name("MeditationAudio")
    AsyncFunction("setTarget") { player: AudioPlayer, volume: Double, holdUntil: Double, endsAt: Double? ->
      targets.getOrPut(player.id) { AmbienceTarget(player, handler) }.setTarget(volume, holdUntil, endsAt)
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("remove") { player: AudioPlayer ->
      targets.remove(player.id)?.remove()
    }.runOnQueue(Queues.MAIN)
    OnDestroy {
      handler.post {
        for (target in targets.values) { try { target.remove() } catch (_: Exception) { /* Player already released. */ } }
        targets.clear()
      }
    }
  }
}
