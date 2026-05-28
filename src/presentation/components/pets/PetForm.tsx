import { useState } from 'react'
import { ScrollView, Alert, Image, Pressable } from 'react-native'
import { YStack, XStack, Text, Button, Input, Spinner } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'

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
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$4">
        <Pressable onPress={pickImage}>
          <YStack height={200} borderRadius={12} backgroundColor="$backgroundHover"
            alignItems="center" justifyContent="center" overflow="hidden">
            {photoUri
              ? <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
              : initialData?.mainPhotoUrl
                ? <Image source={{ uri: initialData.mainPhotoUrl }} style={{ width: '100%', height: '100%' }} />
                : <Text color="$colorMuted">📷 Toca para agregar foto</Text>
            }
          </YStack>
        </Pressable>

        <Input placeholder="Nombre de la mascota" value={form.name}
          onChangeText={v => setForm(p => ({ ...p, name: v }))} />
        <Input placeholder="Raza (opcional)" value={form.breed}
          onChangeText={v => setForm(p => ({ ...p, breed: v }))} />
        <Input placeholder="Descripción" value={form.description}
          onChangeText={v => setForm(p => ({ ...p, description: v }))}
          multiline numberOfLines={3} />
        <Input placeholder="Edad (años)" value={form.ageYears}
          onChangeText={v => setForm(p => ({ ...p, ageYears: v }))}
          keyboardType="numeric" />

        <XStack gap="$2" flexWrap="wrap">
          <YStack gap="$1" flex={1}>
            <Text fontSize={12} color="$colorMuted">Especie</Text>
            <XStack gap="$1">
              {['dog', 'cat', 'rabbit', 'bird', 'other'].map(s => (
                <Button key={s} size="$3" flex={1}
                  onPress={() => setForm(p => ({ ...p, species: s }))}
                  backgroundColor={form.species === s ? '$primary' : '$backgroundHover'}>
                  {s === 'dog' ? 'Perro' : s === 'cat' ? 'Gato' : s === 'rabbit' ? 'Conejo' : s === 'bird' ? 'Ave' : 'Otro'}
                </Button>
              ))}
            </XStack>
          </YStack>
        </XStack>

        <XStack gap="$2">
          <YStack gap="$1" flex={1}>
            <Text fontSize={12} color="$colorMuted">Tamaño</Text>
            <XStack gap="$1">
              {['small', 'medium', 'large'].map(s => (
                <Button key={s} size="$3" flex={1}
                  onPress={() => setForm(p => ({ ...p, size: s }))}
                  backgroundColor={form.size === s ? '$primary' : '$backgroundHover'}>
                  {s === 'small' ? 'Peq' : s === 'medium' ? 'Med' : 'Grande'}
                </Button>
              ))}
            </XStack>
          </YStack>
          <YStack gap="$1" flex={1}>
            <Text fontSize={12} color="$colorMuted">Género</Text>
            <XStack gap="$1">
              {['male', 'female'].map(g => (
                <Button key={g} size="$3" flex={1}
                  onPress={() => setForm(p => ({ ...p, gender: g }))}
                  backgroundColor={form.gender === g ? '$primary' : '$backgroundHover'}>
                  {g === 'male' ? 'Macho' : 'Hembra'}
                </Button>
              ))}
            </XStack>
          </YStack>
        </XStack>

        <XStack gap="$2" flexWrap="wrap">
          {(['isVaccinated', 'isSterilized', 'isDewormed'] as const).map(key => (
            <Button key={key} size="$3"
              onPress={() => setForm(p => ({ ...p, [key]: !p[key] }))}
              backgroundColor={form[key] ? '$green8' : '$backgroundHover'}>
              {key === 'isVaccinated' ? '✅ Vacunado' : key === 'isSterilized' ? '✅ Esterilizado' : '✅ Desparasitado'}
            </Button>
          ))}
        </XStack>

        {showStatus && (
          <XStack gap="$2">
              {['available', 'pending', 'adopted'].map(s => (
              <Button key={s} flex={1} size="$3"
                onPress={() => setForm(p => ({ ...p, status: s }))}
                backgroundColor={form.status === s ? '$primary' : '$backgroundHover'}>
                {s === 'available' ? 'Disponible' : s === 'pending' ? 'Pendiente' : 'Adoptado'}
              </Button>
            ))}
          </XStack>
        )}

        <Button onPress={handleSubmit} disabled={loading} backgroundColor="$primary"
          icon={loading ? <Spinner /> : undefined}>
          {loading ? 'Guardando...' : submitLabel}
        </Button>
      </YStack>
    </ScrollView>
  )
}
