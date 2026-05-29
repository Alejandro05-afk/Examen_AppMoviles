import { Stack, Redirect } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../src/data/supabase/client'
import { colors, borderRadius } from '../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

export default function ShelterLayout() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }
  if (user?.role !== 'shelter') {
    return <Redirect href="/(adopter)/home" />
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
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="requests" options={{ title: 'Solicitudes' }} />
      <Stack.Screen name="pets/index" options={{ title: 'Mis Mascotas' }} />
      <Stack.Screen name="pets/create" options={{ title: 'Nueva Mascota' }} />
      <Stack.Screen name="pets/[id]/edit" options={{ title: 'Editar Mascota' }} />
      <Stack.Screen name="pets/[id]/adoption-requests" options={{ title: 'Solicitudes' }} />
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
