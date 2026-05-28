import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { supabase } from '../supabase/client'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true,
  }),
})

export class NotificationsDataSource {
  async registerPushToken(userId: string): Promise<void> {
    if (!Device.isDevice) return

    const { status: existing } = await Notifications.getPermissionsAsync()
    let finalStatus = existing
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') return

    const tokenData = await Notifications.getExpoPushTokenAsync()
    const token = tokenData.data

    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId)
  }
}
