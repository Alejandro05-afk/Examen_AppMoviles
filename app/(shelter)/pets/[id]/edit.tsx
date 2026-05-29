import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../../../src/data/supabase/client'
import { deletePetUseCase, updatePetUseCase } from '../../../../src/di/container'
import { PetForm, PetFormData } from '../../../../src/presentation/components/pets/PetForm'
import { colors, borderRadius } from '../../../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

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
      ageYears: parseInt(form.ageYears),
      isVaccinated: form.isVaccinated,
      isSterilized: form.isSterilized,
      isDewormed: form.isDewormed,
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
    <View style={styles.container}>
      <PetForm
        initialData={initialData}
        onSubmit={handleSubmit}
        submitLabel="Guardar Cambios"
        showStatus
      />
      <View style={styles.deleteSection}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Feather name="trash-2" size={18} color="white" />
          <Text style={styles.deleteButtonText}>Eliminar Mascota</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  deleteSection: {
    padding: 16,
    paddingTop: 0,
  },
  deleteButton: {
    backgroundColor: colors.alert,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
})
