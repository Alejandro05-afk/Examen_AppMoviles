import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native'
import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { resetPasswordUseCase } from '../../src/di/container'
import { colors, borderRadius, shadows } from '../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (!email) return Alert.alert('Error', 'Ingresa tu email')
    setLoading(true)
    try {
      await resetPasswordUseCase.execute(email)
      setSent(true)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <Feather name="check-circle" size={64} color={colors.secondary} />
        <Text style={styles.title}>Revisa tu email</Text>
        <Text style={styles.subtitle}>Te hemos enviado un enlace para restablecer tu contraseña.</Text>
        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.buttonOutline}>
            <Feather name="arrow-left" size={18} color={colors.primary} />
            <Text style={styles.buttonOutlineText}>  Volver al inicio de sesión</Text>
          </Pressable>
        </Link>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Feather name="lock" size={48} color={colors.primary} />
      <Text style={styles.title}>Restablecer contraseña</Text>
      <Text style={styles.subtitle}>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</Text>

      <View style={styles.inputContainer}>
        <Feather name="mail" size={18} color={colors.textLight} style={styles.inputIcon} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor={colors.textLight} />
      </View>

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <><Feather name="send" size={18} color="white" /><Text style={styles.buttonText}>  Enviar enlace</Text></>}
      </Pressable>

      <Link href="/(auth)/login" asChild>
        <Pressable>
          <Text style={styles.inlineLink}>Volver al inicio de sesión</Text>
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.background, gap: 16, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', color: colors.text },
  subtitle: { fontSize: 15, textAlign: 'center', color: colors.textLight },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: 14, width: '100%' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text },
  button: { flexDirection: 'row', backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', width: '100%', ...shadows.button },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  buttonOutline: { flexDirection: 'row', borderWidth: 1, borderColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: colors.card },
  buttonOutlineText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  inlineLink: { textAlign: 'center', color: colors.primary, fontWeight: '600', fontSize: 14 },
})
