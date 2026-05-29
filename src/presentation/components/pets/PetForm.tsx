import { useState } from 'react'
import { ScrollView, Alert, Image, Pressable, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, View, Text } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { colors, borderRadius, shadows } from '../../theme'
import Feather from '@expo/vector-icons/Feather'

export interface PetFormData {
  name: string
  species: string
  breed: string
  size: string
  gender: string
  description: string
  ageYears: string
  isVaccinated: boolean
  isSterilized: boolean
  isDewormed: boolean
  status: string
}

interface Props {
  initialData?: Partial<PetFormData & { mainPhotoUrl?: string; status?: string }>
  onSubmit: (data: PetFormData, photoUri?: string) => Promise<void>
  submitLabel?: string
  loading?: boolean
  showStatus?: boolean
}

export const PetForm = ({ initialData, onSubmit, submitLabel = 'Guardar', loading: externalLoading, showStatus }: Props) => {
  const [internalLoading, setInternalLoading] = useState(false)
  const loading = externalLoading ?? internalLoading
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [form, setForm] = useState<PetFormData>({
    name: initialData?.name ?? '',
    species: initialData?.species ?? 'dog',
    breed: initialData?.breed ?? '',
    size: initialData?.size ?? 'medium',
    gender: initialData?.gender ?? 'male',
    description: initialData?.description ?? '',
    ageYears: initialData?.ageYears ?? '0',
    isVaccinated: initialData?.isVaccinated ?? false,
    isSterilized: initialData?.isSterilized ?? false,
    isDewormed: initialData?.isDewormed ?? false,
    status: initialData?.status ?? 'available',
  })

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  const handleSubmit = async () => {
    if (!form.name) return Alert.alert('Error', 'Nombre es requerido')
    setInternalLoading(true)
    try {
      await onSubmit(form, photoUri ?? undefined)
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar la mascota')
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Pressable onPress={pickImage}>
          <View style={styles.photoContainer}>
            {photoUri
              ? <Image source={{ uri: photoUri }} style={styles.photo} />
              : initialData?.mainPhotoUrl
                ? <Image source={{ uri: initialData.mainPhotoUrl }} style={styles.photo} />
                : <Text style={styles.photoPlaceholder}>📷 Toca para agregar foto</Text>
            }
          </View>
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="Nombre de la mascota"
          value={form.name}
          onChangeText={v => setForm(p => ({ ...p, name: v }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Raza (opcional)"
          value={form.breed}
          onChangeText={v => setForm(p => ({ ...p, breed: v }))}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción"
          value={form.description}
          onChangeText={v => setForm(p => ({ ...p, description: v }))}
          multiline
          numberOfLines={3}
        />
        <TextInput
          style={styles.input}
          placeholder="Edad (años)"
          value={form.ageYears}
          onChangeText={v => setForm(p => ({ ...p, ageYears: v }))}
          keyboardType="numeric"
        />

        <View style={styles.section}>
          <Text style={styles.label}>Especie</Text>
          <View style={styles.buttonGroup}>
            {['dog', 'cat', 'rabbit', 'bird', 'other'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.button, form.species === s && styles.buttonActive]}
                onPress={() => setForm(p => ({ ...p, species: s }))}
              >
                <Text style={[styles.buttonText, form.species === s && styles.buttonTextActive]}>
                  {s === 'dog' ? 'Perro' : s === 'cat' ? 'Gato' : s === 'rabbit' ? 'Conejo' : s === 'bird' ? 'Ave' : 'Otro'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Tamaño</Text>
            <View style={styles.buttonGroup}>
              {['small', 'medium', 'large'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.button, form.size === s && styles.buttonActive]}
                  onPress={() => setForm(p => ({ ...p, size: s }))}
                >
                  <Text style={[styles.buttonText, form.size === s && styles.buttonTextActive]}>
                    {s === 'small' ? 'Peq' : s === 'medium' ? 'Med' : 'Grande'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Género</Text>
            <View style={styles.buttonGroup}>
              {['male', 'female'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.button, form.gender === g && styles.buttonActive]}
                  onPress={() => setForm(p => ({ ...p, gender: g }))}
                >
                  <Text style={[styles.buttonText, form.gender === g && styles.buttonTextActive]}>
                    {g === 'male' ? 'Macho' : 'Hembra'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          {(['isVaccinated', 'isSterilized', 'isDewormed'] as const).map(key => (
            <TouchableOpacity
              key={key}
              style={[styles.button, form[key] && styles.buttonGreen]}
              onPress={() => setForm(p => ({ ...p, [key]: !p[key] }))}
            >
              <Text style={[styles.buttonText, form[key] && styles.buttonTextActive]}>
                {key === 'isVaccinated' ? '✅ Vacunado' : key === 'isSterilized' ? '✅ Esterilizado' : '✅ Desparasitado'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {showStatus && (
          <View style={styles.section}>
            {['available', 'pending', 'adopted'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.button, form.status === s && styles.buttonActive, styles.buttonFull]}
                onPress={() => setForm(p => ({ ...p, status: s }))}
              >
                <Text style={[styles.buttonText, form.status === s && styles.buttonTextActive]}>
                  {s === 'available' ? 'Disponible' : s === 'pending' ? 'Pendiente' : 'Adoptado'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <><Feather name="check" size={18} color="white" /><Text style={styles.submitButtonText}>{submitLabel}</Text></>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  photoContainer: {
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    color: colors.textLight,
    fontSize: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  buttonActive: {
    backgroundColor: colors.primary,
  },
  buttonGreen: {
    backgroundColor: colors.secondary,
  },
  buttonFull: {
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    color: colors.text,
  },
  buttonTextActive: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  half: {
    flex: 1,
    gap: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
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
