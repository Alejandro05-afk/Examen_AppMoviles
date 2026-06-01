import { useEffect, useState } from 'react'
import { ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { createAdoptionRequestUseCase } from '../../src/di/container'
import { LottieSuccess } from '../../src/presentation/components/common/LottieSuccess'
import LottieView from 'lottie-react-native'
import { StatusBar } from 'expo-status-bar'
import { YStack, XStack, Text } from 'tamagui'
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
          <Feather name="arrow-left" size={20} color="#3D2314" />
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

  const update = (field: keyof typeof form) => (value: string) => setForm(prev => ({ ...prev, [field]: value.replace(/[0-9]/g, '') }))

  if (showSuccess) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$cream">
        <LottieView source={require('../../assets/lottie/heart.json')} autoPlay loop={false} style={{ width: 120, height: 120 }} />
        <LottieSuccess message="Solicitud enviada correctamente" onFinish={() => router.back()} />
      </YStack>
    )
  }

  const handleSubmit = async () => {
    if (!form.reason.trim()) {
      Alert.alert('Campo requerido', 'Por favor indica por qué quieres adoptar.')
      return
    }
    if (form.reason.trim().length < 10) {
      Alert.alert('Campo requerido', 'La motivación debe tener al menos 10 caracteres')
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

  const inputStyle = {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#3D2314',
  }

  const textAreaStyle = {
    ...inputStyle,
    height: 80,
    textAlignVertical: 'top' as const,
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1 }}>
        <YStack padding="$4" gap="$5">
          <YStack alignItems="center" gap="$2">
            <Feather name="edit" size={32} color="#FF6B6B" />
            <Text fontSize={24} fontWeight="bold" color="$chocolate">Solicitud de Adopción</Text>
            <Text fontSize={16} color="$bark" textAlign="center">Estás solicitando adoptar a {petName}</Text>
          </YStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$chocolate">¿Por qué quieres adoptar? *</Text>
            <XStack backgroundColor="white" borderWidth={1} borderColor="#E8E0D6" borderRadius={12} paddingHorizontal="$3.5" paddingVertical="$1" alignItems="flex-start">
              <Feather name="heart" size={16} color="#8B6F47" style={{ marginTop: 10, marginRight: 8 }} />
              <TextInput
                style={textAreaStyle}
                placeholder="Explica tu motivación..."
                value={form.reason}
                onChangeText={update('reason')}
                multiline
                numberOfLines={4}
                placeholderTextColor="#8B6F47"
              />
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$chocolate">Experiencia con mascotas</Text>
            <XStack backgroundColor="white" borderWidth={1} borderColor="#E8E0D6" borderRadius={12} paddingHorizontal="$3.5" paddingVertical="$1" alignItems="center">
              <Feather name="award" size={16} color="#8B6F47" style={{ marginRight: 8 }} />
              <TextInput
                style={inputStyle}
                placeholder="Describe tu experiencia..."
                value={form.experience}
                onChangeText={update('experience')}
                placeholderTextColor="#8B6F47"
              />
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$chocolate">¿Tienes otras mascotas?</Text>
            <XStack backgroundColor="white" borderWidth={1} borderColor="#E8E0D6" borderRadius={12} paddingHorizontal="$3.5" paddingVertical="$1" alignItems="center">
              <Feather name="users" size={16} color="#8B6F47" style={{ marginRight: 8 }} />
              <TextInput
                style={inputStyle}
                placeholder="Describe tus otras mascotas..."
                value={form.otherPets}
                onChangeText={update('otherPets')}
                placeholderTextColor="#8B6F47"
              />
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$chocolate">Tipo de vivienda</Text>
            <XStack backgroundColor="white" borderWidth={1} borderColor="#E8E0D6" borderRadius={12} paddingHorizontal="$3.5" paddingVertical="$1" alignItems="center">
              <Feather name="home" size={16} color="#8B6F47" style={{ marginRight: 8 }} />
              <TextInput
                style={inputStyle}
                placeholder="Apartamento, casa, etc."
                value={form.housingType}
                onChangeText={update('housingType')}
                placeholderTextColor="#8B6F47"
              />
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$chocolate">¿Tienes patio/jardín?</Text>
            <XStack gap="$3">
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: form.hasYard === 'yes' ? '#FF6B6B' : 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: form.hasYard === 'yes' ? '#FF6B6B' : '#E8E0D6',
                }}
                onPress={() => update('hasYard')('yes')}
              >
                <Feather name="check" size={16} color={form.hasYard === 'yes' ? 'white' : '#3D2314'} />
                <Text color={form.hasYard === 'yes' ? 'white' : '$chocolate'} fontSize={14}>  Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: form.hasYard === 'no' ? '#FF6B6B' : 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: form.hasYard === 'no' ? '#FF6B6B' : '#E8E0D6',
                }}
                onPress={() => update('hasYard')('no')}
              >
                <Feather name="x" size={16} color={form.hasYard === 'no' ? 'white' : '#3D2314'} />
                <Text color={form.hasYard === 'no' ? 'white' : '$chocolate'} fontSize={14}>  No</Text>
              </TouchableOpacity>
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$chocolate">Información adicional</Text>
            <XStack backgroundColor="white" borderWidth={1} borderColor="#E8E0D6" borderRadius={12} paddingHorizontal="$3.5" paddingVertical="$1" alignItems="flex-start">
              <Feather name="file-text" size={16} color="#8B6F47" style={{ marginTop: 10, marginRight: 8 }} />
              <TextInput
                style={textAreaStyle}
                placeholder="Cualquier otra información relevante..."
                value={form.additionalInfo}
                onChangeText={update('additionalInfo')}
                multiline
                numberOfLines={3}
                placeholderTextColor="#8B6F47"
              />
            </XStack>
          </YStack>

          <TouchableOpacity
            style={{
              backgroundColor: '#FF6B6B',
              paddingVertical: 16,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              opacity: submitting ? 0.6 : 1,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            }}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <><Feather name="send" size={18} color="white" /><Text color="white" fontSize={16} fontWeight="bold">  Enviar Solicitud</Text></>
            )}
          </TouchableOpacity>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
