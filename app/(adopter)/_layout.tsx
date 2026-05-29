import { Stack, Redirect } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../src/data/supabase/client'
import { colors, borderRadius } from '../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

export default function AdopterLayout() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }
  if (user?.role !== 'adopter') {
    return <Redirect href="/(shelter)/dashboard" />
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.replace('/(auth)/login')
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerRight: () => (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={16} color="white" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="pet/[id]" options={{ title: 'Detalle' }} />
      <Stack.Screen name="adopt-form" options={{ title: 'Solicitar Adopción', presentation: 'modal' }} />
      <Stack.Screen name="my-requests" options={{ title: 'Mis Solicitudes' }} />
      <Stack.Screen name="ai-chat" options={{ title: 'Asistente IA', headerRight: () => null }} />
      <Stack.Screen name="map" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[requestId]" options={{ title: 'Chat' }} />
    </Stack>
  )
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: colors.alert,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    marginRight: 8,
  },
})
