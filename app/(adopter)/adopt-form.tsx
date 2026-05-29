import { useState } from 'react'
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { YStack, XStack, Text, Button, Input, TextArea, Card } from 'tamagui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { createAdoptionRequestUseCase } from '../../src/di/container'

export default function AdoptFormScreen() {
  const { petId, shelterId, petName } = useLocalSearchParams<{ petId: string; shelterId: string; petName: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    reason: '',
    experience: '',
    otherPets: '',
    housingType: '',
    hasYard: '',
    additionalInfo: '',
  })

  const update = (field: keyof typeof form) => (value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.reason.trim()) {
      Alert.alert('Campo requerido', 'Por favor indica por qué quieres adoptar.')
      return
    }

    setSubmitting(true)
    try {
      const message = [
        `🎯 Motivo: ${form.reason}`,
        form.experience ? `🐾 Experiencia: ${form.experience}` : null,
        form.otherPets ? `🐕 Otras mascotas: ${form.otherPets}` : null,
        form.housingType ? `🏠 Vivienda: ${form.housingType}` : null,
        form.hasYard ? `🌳 Espacio exterior: ${form.hasYard}` : null,
        form.additionalInfo ? `📝 Comentarios: ${form.additionalInfo}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      await createAdoptionRequestUseCase.execute(petId, user!.id, shelterId, message)
      Alert.alert('Solicitud enviada', 'El refugio revisará tu solicitud y te responderá pronto.')
      router.back()
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo enviar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card padding="$4" borderRadius={12} backgroundColor="$primary">
          <Text color="white" fontSize={18} fontWeight="bold">Solicitar adopción</Text>
          <Text color="white" opacity={0.9} fontSize={14} mt="$1">
            {petName ? `Mascota: ${petName}` : ''}
          </Text>
        </Card>

        <YStack gap="$2">
          <Text fontWeight="600">¿Por qué quieres adoptar? *</Text>
          <TextArea
            placeholder="Cuéntanos tus motivos..."
            value={form.reason}
            onChangeText={update('reason')}
            minHeight={80}
          />
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600">¿Tienes experiencia previa con mascotas?</Text>
          <TextArea
            placeholder="Si has tenido mascotas antes, cuéntanos..."
            value={form.experience}
            onChangeText={update('experience')}
            minHeight={60}
          />
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600">¿Tienes otras mascotas en casa?</Text>
          <TextArea
            placeholder="Indica si tienes otras mascotas y cuáles son..."
            value={form.otherPets}
            onChangeText={update('otherPets')}
            minHeight={60}
          />
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600">Tipo de vivienda</Text>
          <XStack gap="$2" flexWrap="wrap">
            {['Casa', 'Departamento', 'Otro'].map(option => (
              <Button
                key={option}
                size="$3"
                flex={1}
                backgroundColor={form.housingType === option ? '$primary' : '$backgroundHover'}
                color={form.housingType === option ? 'white' : '$color'}
                onPress={() => update('housingType')(form.housingType === option ? '' : option)}
              >
                {option}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600">¿Tienes patio o espacio exterior?</Text>
          <XStack gap="$2">
            {['Sí', 'No'].map(option => (
              <Button
                key={option}
                size="$3"
                flex={1}
                backgroundColor={form.hasYard === option ? '$primary' : '$backgroundHover'}
                color={form.hasYard === option ? 'white' : '$color'}
                onPress={() => update('hasYard')(form.hasYard === option ? '' : option)}
              >
                {option}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600">Información adicional</Text>
          <TextArea
            placeholder="Cualquier otra información que quieras compartir..."
            value={form.additionalInfo}
            onChangeText={update('additionalInfo')}
            minHeight={60}
          />
        </YStack>

        <Button
          onPress={handleSubmit}
          disabled={submitting}
          backgroundColor="$primary"
          size="$5"
          icon={submitting ? undefined : undefined}
        >
          {submitting ? 'Enviando...' : 'Enviar solicitud'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}