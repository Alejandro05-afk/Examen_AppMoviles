import { Tabs, Redirect } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

export default function AdopterLayout() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }
  if (user?.role !== 'adopter') {
    return <Redirect href="/(shelter)/dashboard" />
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
        name="home"
        options={{
          title: 'Inicio',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-requests"
        options={{
          title: 'Mis Solicitudes',
          tabBarIcon: ({ color, size }) => <Feather name="heart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Feather name="map-pin" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'Asistente',
          tabBarIcon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
          headerRight: () => null,
        }}
      />
      <Tabs.Screen
        name="pet/[id]"
        options={{ href: null, headerShown: true, title: 'Detalle' }}
      />
      <Tabs.Screen
        name="adopt-form"
        options={{ href: null, headerShown: true, title: 'Solicitar Adopción' }}
      />
      <Tabs.Screen
        name="chat/[requestId]"
        options={{
          href: null,
          headerShown: true,
          title: 'Chat',
          headerLeft: () => (
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(adopter)/my-requests')}>
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
  },
})
