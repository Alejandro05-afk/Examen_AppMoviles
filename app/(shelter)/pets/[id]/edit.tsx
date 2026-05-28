import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { YStack, Text, Button } from 'tamagui'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { updatePetUseCase, deletePetUseCase } from '../../../../src/di/container'
import { supabase } from '../../../../src/data/supabase/client'
import { PetForm, PetFormData } from '../../../../src/presentation/components/pets/PetForm'

export default function EditPetScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [initialData, setInitialData] = useState<any>(null)

  useEffect(() => {
    loadPet()
  }, [])

  const loadPet = async () => {
    const { data } = await supabase.from('pets').select('*').eq('id', id).single()
    if (data) {
      setInitialData({
        name: data.name,
        species: data.species,
        breed: data.breed ?? '',
        size: data.size,
        gender: data.gender,
        description: data.description ?? '',
        ageYears: String(data.age_years ?? 0),
        isVaccinated: data.is_vaccinated ?? false,
        isSterilized: data.is_sterilized ?? false,
        isDewormed: data.is_dewormed ?? false,
        mainPhotoUrl: data.main_photo_url,
        status: data.status,
      })
    }
  }

  const handleSubmit = async (form: PetFormData, photoUri?: string) => {
    await updatePetUseCase.execute(id as string, {
      name: form.name,
      species: form.species,
      breed: form.breed,
      size: form.size,
      gender: form.gender,
      description: form.description,
      age_years: parseInt(form.ageYears),
      is_vaccinated: form.isVaccinated,
      is_sterilized: form.isSterilized,
      is_dewormed: form.isDewormed,
      status: form.status,
    }, photoUri)
    Alert.alert('Actualizado', 'Mascota actualizada correctamente')
    router.back()
  }

  const handleDelete = () => {
    Alert.alert('Eliminar', '¿Eliminar esta mascota?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await deletePetUseCase.execute(id as string)
        router.back()
      }}
    ])
  }

  if (!initialData) return null

  return (
    <YStack flex={1}>
      <PetForm
        initialData={initialData}
        onSubmit={handleSubmit}
        submitLabel="Guardar Cambios"
        showStatus
      />
      <YStack padding="$4" pt={0}>
        <Button onPress={handleDelete} backgroundColor="$red8">
          Eliminar Mascota
        </Button>
      </YStack>
    </YStack>
  )
}
