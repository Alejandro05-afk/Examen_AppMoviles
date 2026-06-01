import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, TouchableOpacity, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../../../src/data/supabase/client'
import { usePets } from '../../../../src/presentation/hooks/usePets'
import { Pet } from '../../../../src/domain/entities/Pet'
import { PetForm, PetFormData } from '../../../../src/presentation/components/pets/PetForm'
import { YStack, Text } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'

export default function EditPetScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { updatePet, deletePet } = usePets()
  const [initialData, setInitialData] = useState<any>(null)
  const { width: screenWidth } = useWindowDimensions()
  const insets = useSafeAreaInsets()

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
    await updatePet(id as string, {
      name: form.name,
      species: form.species as Pet['species'],
      breed: form.breed,
      size: form.size as Pet['size'],
      gender: form.gender as Pet['gender'],
      description: form.description,
      ageYears: parseInt(form.ageYears),
      isVaccinated: form.isVaccinated,
      isSterilized: form.isSterilized,
      isDewormed: form.isDewormed,
      status: form.status as Pet['status'],
    }, photoUri)
    Alert.alert('Actualizado', 'Mascota actualizada correctamente')
    router.back()
  }

  const handleDelete = () => {
    Alert.alert('Eliminar', '¿Eliminar esta mascota?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await deletePet(id as string)
        router.back()
      }}
    ])
  }

  if (!initialData) return null

  const deleteIconSize = screenWidth > 400 ? 18 : 16
  const deleteFontSize = screenWidth > 400 ? 16 : 14
  const deletePadding = screenWidth > 400 ? 16 : 12

  return (
    <YStack flex={1} backgroundColor="$cream" paddingBottom={insets.bottom}>
      <PetForm
        initialData={initialData}
        onSubmit={handleSubmit}
        submitLabel="Guardar Cambios"
        showStatus
      />
      <YStack paddingHorizontal="$4" paddingTop={0}>
        <TouchableOpacity
          style={{ backgroundColor: '#E85555', paddingVertical: deletePadding, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
          onPress={handleDelete}
        >
          <Feather name="trash-2" size={deleteIconSize} color="white" />
          <Text color="white" fontSize={deleteFontSize} fontWeight="bold">Eliminar Mascota</Text>
        </TouchableOpacity>
      </YStack>
    </YStack>
  )
}
