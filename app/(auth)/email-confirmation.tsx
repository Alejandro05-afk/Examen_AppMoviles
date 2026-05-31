import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, borderRadius } from '../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

export default function EmailConfirmationScreen() {
  return (
    <View style={styles.container}>
      <Feather name="mail" size={64} color={colors.primary} />
      <Text style={styles.title}>Revisa tu correo</Text>
      <Text style={styles.subtitle}>
        Te hemos enviado un enlace de confirmación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
      </Text>
      <Pressable style={styles.button} onPress={() => router.replace('/(auth)/login')}>
        <Feather name="arrow-left" size={16} color="white" />
        <Text style={styles.buttonText}>  Volver al inicio de sesión</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: 16 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: colors.text },
  subtitle: { fontSize: 15, textAlign: 'center', color: colors.textLight, lineHeight: 22, paddingHorizontal: 16 },
  button: { flexDirection: 'row', backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
})
