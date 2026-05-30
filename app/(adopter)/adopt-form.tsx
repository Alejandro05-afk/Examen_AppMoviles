import { useEffect, useState } from 'react'
import { ScrollView, Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { createAdoptionRequestUseCase } from '../../src/di/container'
import { colors, borderRadius, shadows } from '../../src/presentation/theme'
import { LottieSuccess } from '../../src/presentation/components/common/LottieSuccess'
import { StatusBar } from 'expo-status-bar'
import Feather from '@expo/vector-icons/Feather'

export default function AdoptFormScreen() {
  const { petId, shelterId, petName } = useLocalSearchParams<{ petId: string; shelterId: string; petName: string }>()
  const router = useRouter()
  const navigation = useNavigation()
  const { user } = useAuthStore()

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity style={{ paddingHorizontal: 8, marginLeft: 4 }} onPress={() => router.replace(`/(adopter)/pet/${petId}`)}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
      ),
    })
  }, [navigation, petId])
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [form, setForm] = useState({
    reason: '',
    experience: '',
    otherPets: '',
    housingType: '',
    hasYard: '',
    additionalInfo: '',
  })

  const update = (field: keyof typeof form) => (value: string) => setForm(prev => ({ ...prev, [field]: value }))

  if (showSuccess) {
    return <LottieSuccess message="Solicitud enviada correctamente" onFinish={() => router.back()} />
  }

  const handleSubmit = async () => {
    if (!form.reason.trim()) {
      Alert.alert('Campo requerido', 'Por favor indica por qué quieres adoptar.')
      return
    }

    setSubmitting(true)
    try {
      const message = [
        `Motivación: ${form.reason}`,
        form.experience && `Experiencia: ${form.experience}`,
        form.otherPets && `Otras mascotas: ${form.otherPets}`,
        form.housingType && `Vivienda: ${form.housingType}`,
        `¿Tiene patio? ${form.hasYard === 'yes' ? 'Sí' : 'No'}`,
        form.additionalInfo && `Adicional: ${form.additionalInfo}`,
      ].filter(Boolean).join('\n')
      await createAdoptionRequestUseCase.execute(petId!, user!.id, shelterId!, message)
      setShowSuccess(true)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Feather name="edit" size={32} color={colors.primary} />
            <Text style={styles.title}>Solicitud de Adopción</Text>
            <Text style={styles.subtitle}>Estás solicitando adoptar a {petName}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>¿Por qué quieres adoptar? *</Text>
            <View style={styles.inputContainer}>
              <Feather name="heart" size={16} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.textArea}
                placeholder="Explica tu motivación..."
                value={form.reason}
                onChangeText={update('reason')}
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Experiencia con mascotas</Text>
            <View style={styles.inputContainer}>
              <Feather name="award" size={16} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Describe tu experiencia..."
                value={form.experience}
                onChangeText={update('experience')}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>¿Tienes otras mascotas?</Text>
            <View style={styles.inputContainer}>
              <Feather name="users" size={16} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Describe tus otras mascotas..."
                value={form.otherPets}
                onChangeText={update('otherPets')}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tipo de vivienda</Text>
            <View style={styles.inputContainer}>
              <Feather name="home" size={16} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Apartamento, casa, etc."
                value={form.housingType}
                onChangeText={update('housingType')}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>¿Tienes patio/jardín?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radio, form.hasYard === 'yes' && styles.radioActive]}
                onPress={() => update('hasYard')('yes')}
              >
                <Feather name="check" size={16} color={form.hasYard === 'yes' ? 'white' : colors.text} />
                <Text style={[styles.radioText, form.hasYard === 'yes' && styles.radioTextActive]}>  Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radio, form.hasYard === 'no' && styles.radioActive]}
                onPress={() => update('hasYard')('no')}
              >
                <Feather name="x" size={16} color={form.hasYard === 'no' ? 'white' : colors.text} />
                <Text style={[styles.radioText, form.hasYard === 'no' && styles.radioTextActive]}>  No</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Información adicional</Text>
            <View style={styles.inputContainer}>
              <Feather name="file-text" size={16} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.textArea}
                placeholder="Cualquier otra información relevante..."
                value={form.additionalInfo}
                onChangeText={update('additionalInfo')}
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <><Feather name="send" size={18} color="white" /><Text style={styles.submitButtonText}>  Enviar Solicitud</Text></>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  headerSection: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  inputIcon: {
    marginTop: 10,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.text,
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radio: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  radioActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: colors.text,
  },
  radioTextActive: {
    color: colors.white,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.button,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
})
