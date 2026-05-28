import { useState } from 'react'
import { Alert } from 'react-native'
import { YStack, Text } from 'tamagui'
import LottieView from 'lottie-react-native'
import { useRouter } from 'expo-router'
import { createPetUseCase } from '../../../src/di/container'
import { useAuthStore } from '../../../src/presentation/store/authStore'
import { PetForm, PetFormData } from '../../../src/presentation/components/pets/PetForm'
import { supabase } from '../../../src/data/supabase/client'

export default function CreatePetScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (form: PetFormData, photoUri?: string) => {
    const { data: shelter } = await supabase
      .from('shelters')
      .select('id')
      .eq('profile_id', user!.id)
      .single()

    if (!shelter) throw new Error('No se encontró el refugio')

    await createPetUseCase.execute({
      shelterId: shelter.id,
      name: form.name,
      species: form.species as any,
      breed: form.breed,
      size: form.size as any,
      gender: form.gender as any,
      description: form.description,
      ageYears: parseInt(form.ageYears),
      ageMonths: 0,
      isVaccinated: form.isVaccinated,
      isSterilized: form.isSterilized,
      isDewormed: form.isDewormed,
      status: 'available',
    }, photoUri)

    setSuccess(true)
    setTimeout(() => router.back(), 2000)
  }

  if (success) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <LottieView
          source={require('../../../assets/lottie/success.json')}
          autoPlay loop={false}
          style={{ width: 200, height: 200 }}
        />
        <Text fontSize={18} fontWeight="bold" color="$color" mt="$4">
          ¡Mascota publicada! 🐾
        </Text>
      </YStack>
    )
  }

  return <PetForm onSubmit={handleSubmit} submitLabel="Publicar Mascota" />
}
