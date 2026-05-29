import { supabase } from '../supabase/client'

export class NotificationsDataSource {
  async registerPushToken(userId: string): Promise<void> {
    try {
      const Notifications = require('expo-notifications')
      const Device = require('expo-device')

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true,
        }),
      })

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
    } catch {
      // Notifications no disponibles en Expo Go
    }
  }
}
