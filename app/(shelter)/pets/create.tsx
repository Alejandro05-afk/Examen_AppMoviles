import { useState } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { PetForm } from '../../../src/presentation/components/pets/PetForm'
import { createPetUseCase } from '../../../src/di/container'
import { useAuthStore } from '../../../src/presentation/store/authStore'
import { colors } from '../../../src/presentation/theme'
import { LottieSuccess } from '../../../src/presentation/components/common/LottieSuccess'
import Feather from '@expo/vector-icons/Feather'

export default function CreatePetScreen() {
  const router = useRouter()
  const { shelterId } = useAuthStore()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (data: any, photoUri?: string) => {
    try {
      await createPetUseCase.execute({
        ...data,
        shelterId: shelterId!,
      }, photoUri)
      setShowSuccess(true)
    } catch (error: any) {
      throw error
    }
  }

  if (showSuccess) {
    return <LottieSuccess message="Mascota creada correctamente" onFinish={() => router.back()} />
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="plus-circle" size={24} color={colors.primary} />
        <Text style={styles.title}>  Nueva Mascota</Text>
      </View>
      <PetForm onSubmit={handleSubmit} submitLabel="Crear Mascota" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
})
