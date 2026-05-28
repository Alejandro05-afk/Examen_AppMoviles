import { Stack } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { Button } from 'tamagui'
import { useRouter } from 'expo-router'
import { supabase } from '../../src/data/supabase/client'

export default function AdopterLayout() {
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.replace('/(auth)/login')
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '$background' },
        headerRight: () => (
          <Button size="$3" onPress={handleLogout} backgroundColor="$red8" mr="$2">
            Salir
          </Button>
        ),
      }}
    >
      <Stack.Screen name="home" options={{ title: 'PetAdopt' }} />
      <Stack.Screen name="pet/[id]" options={{ title: 'Detalle' }} />
      <Stack.Screen name="my-requests" options={{ title: 'Mis Solicitudes' }} />
      <Stack.Screen name="ai-chat" options={{ title: 'Asistente IA' }} />
      <Stack.Screen name="map" options={{ title: 'Refugios Cercanos' }} />
      <Stack.Screen name="chat/[requestId]" options={{ title: 'Chat' }} />
    </Stack>
  )
}
