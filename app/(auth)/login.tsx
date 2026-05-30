import { useEffect, useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native'
import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import LottieView from 'lottie-react-native'
import { useAuth } from '../../src/presentation/hooks/useAuth'
import { colors, borderRadius, shadows } from '../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const animRef = useRef<LottieView>(null)

  useEffect(() => {
    animRef.current?.play()
  }, [])

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Completa todos los campos')
    setLoading(true)
    try {
      await login(email, password)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
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
        <LottieView
          ref={animRef}
          source={require('../../assets/lottie/paw-animation.json')}
          loop
          resizeMode="contain"
            style={{ width: 80, height: 80 }}
        />
        <Text style={styles.title}>PetAdopt</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      </View>

      <View style={styles.inputContainer}>
        <Feather name="mail" size={18} color={colors.textLight} style={styles.inputIcon} />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor={colors.textLight}
        />
      </View>
      <View style={styles.inputContainer}>
        <Feather name="lock" size={18} color={colors.textLight} style={styles.inputIcon} />
        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor={colors.textLight}
        />
      </View>

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <><Feather name="log-in" size={18} color="white" /><Text style={styles.buttonText}>  Iniciar Sesión</Text></>}
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable style={[styles.buttonOutline, loading && styles.buttonDisabled]} onPress={handleGoogleLogin} disabled={loading}>
        <Feather name="globe" size={18} color={colors.primary} />
        <Text style={styles.buttonOutlineText}>  Continuar con Google</Text>
      </Pressable>

      <View style={styles.links}>
        <Link href="/(auth)/register" asChild>
          <Pressable style={styles.linkButton}>
            <Feather name="user-plus" size={16} color={colors.text} />
            <Text style={styles.linkText}>  Crear cuenta</Text>
          </Pressable>
        </Link>
        <Link href="/(auth)/forgot-password" asChild>
          <Pressable>
            <Text style={styles.inlineLink}>¿Olvidaste tu contraseña?</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 14,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: colors.textLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textLight,
    fontSize: 14,
  },
  buttonOutline: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  buttonOutlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  links: {
    gap: 12,
    marginTop: 8,
  },
  linkButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  linkText: {
    color: colors.text,
    fontWeight: '700',
  },
  inlineLink: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
})
