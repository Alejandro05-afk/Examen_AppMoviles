import { useState } from 'react'
import { ScrollView, Alert, Image, Pressable, TextInput, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { YStack, XStack, Text } from 'tamagui'
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

const inputBase = (fontSize: number) => ({
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '#E8E0D6',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize,
  color: '#3D2314',
})

export const PetForm = ({ initialData, onSubmit, submitLabel = 'Guardar', loading: externalLoading, showStatus }: Props) => {
  const [internalLoading, setInternalLoading] = useState(false)
  const { width: screenWidth } = useWindowDimensions()
  const isLarge = screenWidth > 400
  const inputFontSize = isLarge ? 16 : 14
  const labelSize = isLarge ? 12 : 11
  const optionSize = isLarge ? 14 : 12
  const cameraIconSize = isLarge ? 24 : 20
  const cameraTextSize = isLarge ? 16 : 14
  const checkSize = isLarge ? 16 : 14
  const checkTextSize = isLarge ? 14 : 12
  const submitPadding = isLarge ? 16 : 14
  const submitIconSize = isLarge ? 18 : 16
  const submitFontSize = isLarge ? 16 : 14
  const btnMinWidth = isLarge ? 60 : 50
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
    const age = parseInt(form.ageYears, 10)
    if (isNaN(age) || age < 0 || age > 30) return Alert.alert('Error', 'Edad inválida (0-30 años)')
    setInternalLoading(true)
    try {
      await onSubmit(form, photoUri ?? undefined)
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar la mascota')
    } finally {
      setInternalLoading(false)
    }
  }

  const btn = (active: boolean) => ({
    backgroundColor: active ? '#FF6B6B' : '#FFF8F0',
    paddingHorizontal: isLarge ? 12 : 8,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minWidth: btnMinWidth,
    flex: 1,
    borderWidth: 0,
  })

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack padding="$4" gap="$4">
        <Pressable onPress={pickImage}>
          <YStack
            height={screenWidth * 0.5}
            borderRadius="$lg"
            backgroundColor="#E8E0D6"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            borderWidth={2}
            borderColor="#E8E0D6"
            borderStyle="dashed"
          >
            {photoUri
              ? <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
              : initialData?.mainPhotoUrl
                ? <Image source={{ uri: initialData.mainPhotoUrl }} style={{ width: '100%', height: '100%' }} />
                : <><Feather name="camera" size={cameraIconSize} color="#8B6F47" /><Text color="$bark" fontSize={cameraTextSize}> Toca para agregar foto</Text></>
            }
          </YStack>
        </Pressable>

        <TextInput
          style={inputBase(inputFontSize)}
          placeholder="Nombre de la mascota"
          value={form.name}
          onChangeText={v => setForm(p => ({ ...p, name: v.replace(/[0-9]/g, '') }))}
          placeholderTextColor="#8B6F47"
        />
        <TextInput
          style={inputBase(inputFontSize)}
          placeholder="Raza (opcional)"
          value={form.breed}
          onChangeText={v => setForm(p => ({ ...p, breed: v }))}
          placeholderTextColor="#8B6F47"
        />
        <TextInput
          style={[inputBase(inputFontSize), { height: Math.min(80, screenWidth * 0.25), textAlignVertical: 'top' }]}
          placeholder="Descripción"
          value={form.description}
          onChangeText={v => setForm(p => ({ ...p, description: v }))}
          multiline
          numberOfLines={3}
          placeholderTextColor="#8B6F47"
        />
        <TextInput
          style={inputBase(inputFontSize)}
          placeholder="Edad (años)"
          value={form.ageYears}
          onChangeText={v => setForm(p => ({ ...p, ageYears: v.replace(/[^0-9]/g, '') }))}
          keyboardType="numeric"
          placeholderTextColor="#8B6F47"
        />

        <YStack gap="$2">
          <Text fontSize={labelSize} color="$bark" fontWeight="600">Especie</Text>
          <YStack gap="$2">
            <XStack gap="$2">
              {(['dog', 'cat', 'rabbit'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={btn(form.species === s)}
                  onPress={() => setForm(p => ({ ...p, species: s }))}
                >
                  <Text style={{ color: form.species === s ? 'white' : '#3D2314', fontSize: optionSize }}>
                    {s === 'dog' ? 'Perro' : s === 'cat' ? 'Gato' : 'Conejo'}
                  </Text>
                </TouchableOpacity>
              ))}
            </XStack>
            <XStack gap="$2">
              {(['bird', 'other'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={btn(form.species === s)}
                  onPress={() => setForm(p => ({ ...p, species: s }))}
                >
                  <Text style={{ color: form.species === s ? 'white' : '#3D2314', fontSize: optionSize }}>
                    {s === 'bird' ? 'Ave' : 'Otro'}
                  </Text>
                </TouchableOpacity>
              ))}
            </XStack>
          </YStack>
        </YStack>

        <XStack gap="$4">
          <YStack flex={1} gap="$2">
            <Text fontSize={labelSize} color="$bark" fontWeight="600">Tamaño</Text>
            <XStack gap="$2">
              {['small', 'medium', 'large'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={btn(form.size === s)}
                  onPress={() => setForm(p => ({ ...p, size: s }))}
                >
                  <Text style={{ color: form.size === s ? 'white' : '#3D2314', fontSize: optionSize }}>
                    {s === 'small' ? 'Peq' : s === 'medium' ? 'Med' : 'Grande'}
                  </Text>
                </TouchableOpacity>
              ))}
            </XStack>
          </YStack>
          <YStack flex={1} gap="$2">
            <Text fontSize={labelSize} color="$bark" fontWeight="600">Género</Text>
            <XStack gap="$2">
              {['male', 'female'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={btn(form.gender === g)}
                  onPress={() => setForm(p => ({ ...p, gender: g }))}
                >
                  <Text style={{ color: form.gender === g ? 'white' : '#3D2314', fontSize: optionSize }}>
                    {g === 'male' ? 'Macho' : 'Hembra'}
                  </Text>
                </TouchableOpacity>
              ))}
            </XStack>
          </YStack>
        </XStack>

        <YStack gap="$2">
          {(['isVaccinated', 'isSterilized', 'isDewormed'] as const).map(key => (
            <TouchableOpacity
              key={key}
              style={{
                backgroundColor: form[key] ? '#4CAF50' : '#FFF8F0',
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 60,
              }}
              onPress={() => setForm(p => ({ ...p, [key]: !p[key] }))}
            >
              <XStack alignItems="center" gap="$1">
                <Feather name="check-circle" size={checkSize} color={form[key] ? 'white' : '#3D2314'} />
                <Text style={{ color: form[key] ? 'white' : '#3D2314', fontSize: checkTextSize }}>
                  {key === 'isVaccinated' ? ' Vacunado' : key === 'isSterilized' ? ' Esterilizado' : ' Desparasitado'}
                </Text>
              </XStack>
            </TouchableOpacity>
          ))}
        </YStack>

        {showStatus && (
          <YStack gap="$2">
            {['available', 'pending', 'adopted'].map(s => (
              <TouchableOpacity
                key={s}
                style={btn(form.status === s)}
                onPress={() => setForm(p => ({ ...p, status: s }))}
              >
                <Text style={{ color: form.status === s ? 'white' : '#3D2314', fontSize: optionSize }}>
                  {s === 'available' ? 'Disponible' : s === 'pending' ? 'Pendiente' : 'Adoptado'}
                </Text>
              </TouchableOpacity>
            ))}
          </YStack>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: '#FF6B6B',
            paddingVertical: submitPadding,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            opacity: loading ? 0.6 : 1,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
          }}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <><Feather name="check" size={submitIconSize} color="white" /><Text color="white" fontSize={submitFontSize} fontWeight="bold">{submitLabel}</Text></>
          )}
        </TouchableOpacity>
      </YStack>
    </ScrollView>
  )
}
