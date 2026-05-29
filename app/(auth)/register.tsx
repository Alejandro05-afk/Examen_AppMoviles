import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native'
import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../../src/presentation/hooks/useAuth'
import { colors, borderRadius, shadows } from '../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

export default function RegisterScreen() {
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'adopter' | 'shelter'>('adopter')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!fullName || !email || !password) return Alert.alert('Error', 'Completa todos los campos')
    if (password.length < 6) return Alert.alert('Error', 'La contrasena debe tener al menos 6 caracteres')
    setLoading(true)
    try {
      await register(email, password, fullName, role)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Feather name="user-plus" size={40} color={colors.primary} />
        <Text style={styles.title}>Crear cuenta</Text>
      </View>

      <View style={styles.inputContainer}>
        <Feather name="user" size={18} color={colors.textLight} style={styles.inputIcon} />
        <TextInput placeholder="Nombre completo" value={fullName} onChangeText={setFullName} style={styles.input} placeholderTextColor={colors.textLight} />
      </View>
      <View style={styles.inputContainer}>
        <Feather name="mail" size={18} color={colors.textLight} style={styles.inputIcon} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor={colors.textLight} />
      </View>
      <View style={styles.inputContainer}>
        <Feather name="lock" size={18} color={colors.textLight} style={styles.inputIcon} />
        <TextInput placeholder="Contraseña (min. 6 caracteres)" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholderTextColor={colors.textLight} />
      </View>

      <View style={styles.segmentRow}>
        <Pressable onPress={() => setRole('adopter')} style={[styles.segment, role === 'adopter' && styles.segmentActive]}>
          <Feather name="heart" size={16} color={role === 'adopter' ? 'white' : colors.text} />
          <Text style={[styles.segmentText, role === 'adopter' && styles.segmentTextActive]}>  Adoptante</Text>
        </Pressable>
        <Pressable onPress={() => setRole('shelter')} style={[styles.segment, role === 'shelter' && styles.segmentActive]}>
          <Feather name="home" size={16} color={role === 'shelter' ? 'white' : colors.text} />
          <Text style={[styles.segmentText, role === 'shelter' && styles.segmentTextActive]}>  Refugio</Text>
        </Pressable>
      </View>

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <><Feather name="check" size={18} color="white" /><Text style={styles.buttonText}>  Crear cuenta</Text></>}
      </Pressable>

      <Link href="/(auth)/login" asChild>
        <Pressable style={styles.loginLink}>
          <Text style={styles.inlineLink}>¿Ya tienes cuenta? Inicia sesión</Text>
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.background, gap: 14 },
  header: { alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', color: colors.text },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.text },
  segmentRow: { flexDirection: 'row', gap: 12 },
  segment: { flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentText: { fontWeight: '700', color: colors.text },
  segmentTextActive: { color: colors.white },
  button: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', ...shadows.button },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  loginLink: { marginTop: 8 },
  inlineLink: { textAlign: 'center', color: colors.primary, fontWeight: '600', fontSize: 14 },
})
