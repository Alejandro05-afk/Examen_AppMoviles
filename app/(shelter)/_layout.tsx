import { Tabs, Redirect } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { TouchableOpacity, StyleSheet } from 'react-native'
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
    try { await supabase.auth.signOut() } catch {}
    logout()
    router.replace('/(auth)/login')
  }

  const headerRight = () => (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Feather name="log-out" size={16} color="white" />
    </TouchableOpacity>
  )

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerRight,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { borderTopColor: colors.border, paddingBottom: 6, paddingTop: 6, height: 60 },
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
        name="pets/index"
        options={{
          title: 'Mascotas',
          tabBarIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pets/create"
        options={{ href: null, headerShown: true, title: 'Nueva Mascota', headerRight }}
      />
      <Tabs.Screen
        name="pets/[id]/edit"
        options={{ href: null, headerShown: true, title: 'Editar Mascota', headerRight }}
      />
      <Tabs.Screen
        name="pets/[id]/adoption-requests"
        options={{ href: null, headerShown: true, title: 'Solicitudes', headerRight }}
      />
      <Tabs.Screen
        name="chat/[requestId]"
        options={{
          href: null,
          headerShown: true,
          title: 'Chat',
          headerRight,
          headerLeft: () => (
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(shelter)/requests')}>
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
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
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
  },
})
