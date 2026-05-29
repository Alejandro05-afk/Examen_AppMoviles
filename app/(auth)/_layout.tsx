import { Stack, Redirect } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated) {
    return <Redirect href={user?.role === 'shelter' ? '/(shelter)/dashboard' : '/(adopter)/home'} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  )
}
