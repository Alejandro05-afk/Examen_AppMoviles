import { Stack } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { Button } from 'tamagui'
import { useRouter } from 'expo-router'
import { supabase } from '../../src/data/supabase/client'

export default function ShelterLayout() {
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
      <Stack.Screen name="dashboard" options={{ title: 'Mi Refugio' }} />
      <Stack.Screen name="pets/index" options={{ title: 'Mis Mascotas' }} />
      <Stack.Screen name="pets/create" options={{ title: 'Nueva Mascota' }} />
      <Stack.Screen name="pets/[id]/edit" options={{ title: 'Editar Mascota' }} />
      <Stack.Screen name="pets/[id]/adoption-requests" options={{ title: 'Solicitudes' }} />
      <Stack.Screen name="chat/[requestId]" options={{ title: 'Chat' }} />
    </Stack>
  )
}
