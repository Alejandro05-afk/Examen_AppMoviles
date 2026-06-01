import { Tabs, Redirect, useRouter } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

export default function ShelterLayout() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }
  if (user?.role !== 'shelter') {
    return <Redirect href="/(adopter)/home" />
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { borderTopColor: colors.border, paddingBottom: 6 + insets.bottom, paddingTop: 6, height: 60 + insets.bottom },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Inicio',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Solicitudes',
          tabBarIcon: ({ color, size }) => <Feather name="file-text" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'Asistente',
          tabBarIcon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
          headerRight: () => null,
          tabBarHideOnKeyboard: true,
        }}
      />
      <Tabs.Screen
        name="pets/create"
        options={{
          href: null,
          headerShown: true,
          title: 'Nueva Mascota',
          headerLeft: () => (
            <TouchableOpacity style={{ paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4 }} onPress={() => router.replace('/(shelter)/dashboard')}>
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="pets/[id]/edit"
        options={{
          href: null,
          headerShown: true,
          title: 'Editar Mascota',
          headerLeft: () => (
            <TouchableOpacity style={{ paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4 }} onPress={() => router.replace('/(shelter)/dashboard')}>
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="pets/[id]/adoption-requests"
        options={{ href: null, headerShown: true, title: 'Solicitudes' }}
      />
      <Tabs.Screen
        name="chat/[requestId]"
        options={{
          href: null,
          headerShown: true,
          title: 'Chat',
          headerLeft: () => (
            <TouchableOpacity style={{ paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4 }} onPress={() => router.replace('/(shelter)/requests')}>
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  )
}
