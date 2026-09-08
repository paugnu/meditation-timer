package expo.modules.meditationfocus

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** DND ownership is persisted before activation; a system alarm restores it even without JS. */
internal object FocusControl {
  private fun prefs(context: Context) = context.getSharedPreferences("meditation_focus", Context.MODE_PRIVATE)
  private fun manager(context: Context) = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
  private fun alarm(context: Context) = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
  private fun pending(context: Context) = PendingIntent.getBroadcast(
    context, 8301, Intent(context, RestoreFocusReceiver::class.java),
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
  )
  fun hasAccess(context: Context) = manager(context).isNotificationPolicyAccessGranted
  fun canScheduleExact(context: Context) = Build.VERSION.SDK_INT < 31 || alarm(context).canScheduleExactAlarms()
  @Synchronized fun begin(context: Context, endsAt: Long) {
    check(hasAccess(context)) { "Notification policy permission required" }
    check(canScheduleExact(context)) { "Exact alarm permission required for reliable restoration" }
    check(endsAt > System.currentTimeMillis()) { "Session has already ended" }
    end(context)
    val nm = manager(context)
    val previous = nm.currentInterruptionFilter
    // Do not weaken an existing user focus mode on Android < 15.
    val target = if (Build.VERSION.SDK_INT < 35 && previous != NotificationManager.INTERRUPTION_FILTER_ALL)
      previous else NotificationManager.INTERRUPTION_FILTER_ALARMS
    check(prefs(context).edit().putBoolean("active", true).putInt("previous", previous)
      .putInt("target", target).putLong("endsAt", endsAt).commit()) { "Unable to persist restoration state" }
    try {
      alarm(context).setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, endsAt, pending(context))
      nm.setInterruptionFilter(target)
    } catch (error: Exception) {
      end(context)
      throw error
    }
  }
  @Synchronized fun end(context: Context) {
    val p = prefs(context)
    if (!p.getBoolean("active", false)) return
    val nm = manager(context)
    if (hasAccess(context)) {
      // Android 15+ changes our implicit rule, never the user's global mode.
      if (Build.VERSION.SDK_INT >= 35) nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
      else if (nm.currentInterruptionFilter == p.getInt("target", NotificationManager.INTERRUPTION_FILTER_ALARMS))
        nm.setInterruptionFilter(p.getInt("previous", NotificationManager.INTERRUPTION_FILTER_ALL))
    }
    p.edit().clear().commit()
    alarm(context).cancel(pending(context))
  }
  fun recover(context: Context) {
    val p = prefs(context)
    if (p.getBoolean("active", false) && p.getLong("endsAt", 0) <= System.currentTimeMillis()) end(context)
  }
}

class RestoreFocusReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    // Reboot/update ends the owned focus interval instead of risking a stuck silent device.
    try { FocusControl.end(context) } catch (_: Exception) { /* Retain state for recovery on next launch. */ }
  }
}

class MeditationFocusModule : Module() {
  private val context: Context get() = requireNotNull(appContext.reactContext)
  override fun definition() = ModuleDefinition {
    Name("MeditationFocus")
    OnCreate { FocusControl.recover(context) }
    Function("hasAccess") { FocusControl.hasAccess(context) }
    Function("canScheduleExact") { FocusControl.canScheduleExact(context) }
    Function("openAccessSettings") {
      context.startActivity(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    Function("openAlarmSettings") {
      if (Build.VERSION.SDK_INT >= 31) context.startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
        Uri.parse("package:${context.packageName}")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    Function("begin") { endsAt: Double -> FocusControl.begin(context, endsAt.toLong()) }
    Function("end") { FocusControl.end(context) }
  }
}
