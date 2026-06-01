import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PetForm } from '../../../src/presentation/components/pets/PetForm'
import { usePets } from '../../../src/presentation/hooks/usePets'
import { useAuthStore } from '../../../src/presentation/store/authStore'
import { LottieSuccess } from '../../../src/presentation/components/common/LottieSuccess'
import { YStack, XStack, Text } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'

export default function CreatePetScreen() {
  const router = useRouter()
  const { shelterId } = useAuthStore()
  const { createPet } = usePets()
  const [showSuccess, setShowSuccess] = useState(false)
  const { width: screenWidth } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const iconSize = screenWidth > 400 ? 24 : 20
  const titleSize = screenWidth > 400 ? 24 : 20

  const handleSubmit = async (data: any, photoUri?: string) => {
    await createPet({
      ...data,
      shelterId: shelterId!,
    }, photoUri)
    setShowSuccess(true)
  }

  if (showSuccess) {
    return <LottieSuccess message="Mascota creada correctamente" onFinish={() => router.back()} />
  }

  return (
    <YStack flex={1} backgroundColor="$cream" paddingHorizontal="$4" paddingTop={insets.top + 8} paddingBottom="$4">
      <XStack alignItems="center" marginBottom="$4">
        <Feather name="plus-circle" size={iconSize} color="#FF6B6B" />
        <Text fontSize={titleSize} fontWeight="bold" color="$chocolate" marginLeft="$2">  Nueva Mascota</Text>
      </XStack>
      <PetForm onSubmit={handleSubmit} submitLabel="Crear Mascota" />
    </YStack>
  )
}
