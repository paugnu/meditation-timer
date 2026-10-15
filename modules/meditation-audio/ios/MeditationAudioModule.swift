import AVFoundation
import ExpoModulesCore

private let fadeMs = 1500.0

/** SharedRef lets this module guard Expo's player without owning another audio engine. */
private final class AmbienceTarget {
  private let player: SharedRef<AVPlayer>
  private var target: Float = 0
  private var initial: Float = 0
  private var startsAt = 0.0
  private var endsAt: Double?
  private var timer: DispatchSourceTimer?
  private var observation: NSKeyValueObservation?
  private var removed = false

  init(_ player: SharedRef<AVPlayer>) {
    self.player = player
    observation = player.ref.observe(\.rate, options: [.new]) { [weak self] _, change in
      guard let self, let rate = change.newValue, rate > 0 else { return }
      self.onMain {
        if !self.canPlay { self.stop() }
      }
    }
  }

  private var now: Double { Date().timeIntervalSince1970 * 1000 }
  private var canPlay: Bool { !removed && target > 0 && (endsAt ?? 0) > now }

  func setTarget(_ volume: Double, holdUntil: Double, deadline: Double?) {
    timer?.cancel()
    timer = nil
    target = volume.isFinite ? Float(min(1, max(0, volume))) : 0
    endsAt = deadline.flatMap { $0.isFinite ? $0 : nil }
    if endsAt == nil { target = 0 }
    initial = player.ref.volume
    startsAt = target > 0 && holdUntil.isFinite ? max(now, holdUntil) : now
    step()
  }

  private func stop() {
    player.ref.volume = 0
    player.ref.pause()
  }

  private func step() {
    guard !removed else { return }
    let time = now
    if let endsAt, time >= endsAt {
      stop()
      return  // Keep the rate observer to reject a stale remote play command.
    }
    let remaining = endsAt.map { $0 - time }
    let progress = Float(min(1, max(0, (time - startsAt) / fadeMs)))
    let envelope = remaining.map { Float(min(1, max(0, $0 / fadeMs))) } ?? 1
    player.ref.volume = (initial + (target - initial) * progress) * envelope
    if progress >= 1 && target == 0 {
      stop()
      return
    }
    let moving = progress < 1 && initial != target
    let ending = remaining.map { $0 <= fadeMs } ?? false
    var wait = (moving && time >= startsAt) || ending ? 50.0 : 1000.0
    if time < startsAt { wait = min(wait, startsAt - time) }
    if let remaining, remaining > fadeMs { wait = min(wait, remaining - fadeMs) }
    if let endsAt { wait = min(wait, endsAt - time) }
    let next = DispatchSource.makeTimerSource(queue: .main)
    next.schedule(deadline: .now() + max(1, wait) / 1000)
    next.setEventHandler { [weak self] in
      self?.timer?.cancel()
      self?.timer = nil
      self?.step()
    }
    timer = next
    next.resume()
  }

  func remove() {
    removed = true
    timer?.cancel()
    timer = nil
    observation?.invalidate()
    observation = nil
    stop()
  }

  private func onMain(_ action: @escaping () -> Void) {
    if Thread.isMainThread { action() } else { DispatchQueue.main.async(execute: action) }
  }
}

public final class MeditationAudioModule: Module {
  private var targets: [ObjectIdentifier: AmbienceTarget] = [:]
  public func definition() -> ModuleDefinition {
    Name("MeditationAudio")
    AsyncFunction("setTarget") { (player: SharedRef<AVPlayer>, volume: Double, holdUntil: Double, endsAt: Double?) in
      let key = ObjectIdentifier(player)
      let target = self.targets[key] ?? AmbienceTarget(player)
      self.targets[key] = target
      target.setTarget(volume, holdUntil: holdUntil, deadline: endsAt)
    }.runOnQueue(.main)
    AsyncFunction("remove") { (player: SharedRef<AVPlayer>) in
      self.targets.removeValue(forKey: ObjectIdentifier(player))?.remove()
    }.runOnQueue(.main)
    OnDestroy {
      DispatchQueue.main.async {
        self.targets.values.forEach { $0.remove() }
        self.targets.removeAll()
      }
    }
  }
}
