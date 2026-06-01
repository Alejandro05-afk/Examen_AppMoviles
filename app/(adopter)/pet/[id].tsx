import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useEffect, useState } from 'react'
import { ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../../src/data/supabase/client'
import { YStack, XStack, Text, Button, Card } from 'tamagui'
import { StatusBar } from 'expo-status-bar'
import Feather from '@expo/vector-icons/Feather'
import { colors } from '../../../src/presentation/theme'

const PLACEHOLDER_IMAGE = 'https://placehold.co/800x600/e2e8f0/a1a1aa?text=Pet'

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { width: screenWidth } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [showHeartAnimation, setShowHeartAnimation] = useState(false)
  const heroHeight = Math.min(screenWidth * 0.75, 400)

  useEffect(() => {
    loadPet()
  }, [])

  const loadPet = async () => {
    const { data } = await supabase
      .from('pets')
      .select('*, shelters(name, address, phone, description)')
      .eq('id', id)
      .single()
    setPet(data)
    setLoading(false)
  }

  const handleAdopt = () => {
    router.push(`/(adopter)/adopt-form?petId=${id}&shelterId=${pet.shelter_id}&petName=${encodeURIComponent(pet.name)}`)
  }

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$cream">
        <LottieView source={require('../../../assets/lottie/loading.json')} autoPlay loop style={{ width: screenWidth * 0.3, height: screenWidth * 0.3 }} />
      </YStack>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8F0' }}>
      <StatusBar style="dark" />
      <YStack backgroundColor="$cream" paddingTop={insets.top}>
        <Image
          source={pet.main_photo_url || PLACEHOLDER_IMAGE}
          contentFit="cover"
          transition={150}
          style={{ width: '100%', height: heroHeight }}
        />

        <YStack padding="$4" gap="$4" paddingBottom={insets.bottom + 24}>
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize={24} fontWeight="700" color="$chocolate">{pet.name}</Text>
            <TouchableOpacity
              onPress={() => { setLiked(!liked); setShowHeartAnimation(true) }}
              style={{ padding: 8 }}
            >
              <Feather name={liked ? 'heart' : 'heart'} size={24} color={liked ? colors.coral : colors.bark} />
            </TouchableOpacity>
          </XStack>
          <XStack gap="$1" alignItems="center" marginTop="$1">
            <Feather name={pet.species === 'dog' ? 'user' : 'user'} size={14} color={colors.bark} />
            <Text fontSize={15} color="$chocolate" textTransform="capitalize">{pet.species}</Text>
            {pet.breed && <Text fontSize={15} color="$bark"> • {pet.breed}</Text>}
            <Text fontSize={15} color="$bark"> • {pet.gender === 'male' ? 'Macho' : 'Hembra'}</Text>
          </XStack>

          {showHeartAnimation && (
            <YStack position="absolute" top={-20} right={0} width={100} height={100} zIndex={10} pointerEvents="none">
              <LottieView source={require('../../../assets/lottie/heart.json')} autoPlay loop={false} style={{ width: 100, height: 100 }} onAnimationFinish={() => setShowHeartAnimation(false)} />
            </YStack>
          )}

          <XStack gap="$2" flexWrap="wrap">
            {pet.is_vaccinated && (
              <XStack backgroundColor="#E6F7ED" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$sm" alignItems="center" gap="$1">
                <Feather name="check" size={12} color={colors.success} />
                <Text fontSize={12} color="$chocolate"> Vacunado</Text>
              </XStack>
            )}
            {pet.is_sterilized && (
              <XStack backgroundColor="#E6F7ED" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$sm" alignItems="center" gap="$1">
                <Feather name="check" size={12} color={colors.success} />
                <Text fontSize={12} color="$chocolate"> Esterilizado</Text>
              </XStack>
            )}
            {pet.is_dewormed && (
              <XStack backgroundColor="#E6F7ED" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$sm" alignItems="center" gap="$1">
                <Feather name="check" size={12} color={colors.success} />
                <Text fontSize={12} color="$chocolate"> Desparasitado</Text>
              </XStack>
            )}
            <XStack backgroundColor="$sand" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$sm" alignItems="center" gap="$1">
              <Feather name="maximize" size={12} color={colors.bark} />
              <Text fontSize={12} color="$chocolate"> {pet.size === 'small' ? 'Pequeño' : pet.size === 'medium' ? 'Mediano' : 'Grande'}</Text>
            </XStack>
          </XStack>

          {pet.description && (
            <YStack gap="$1">
              <Text fontSize={18} fontWeight="600" color="$chocolate">Descripción</Text>
              <Text fontSize={14} color="$bark" lineHeight={22}>{pet.description}</Text>
            </YStack>
          )}

          <Card backgroundColor="$white" padding="$4" borderRadius="$md" borderWidth={1} borderColor="$border" gap="$2">
            <XStack alignItems="center" gap="$2">
              <Feather name="home" size={18} color={colors.coral} />
              <Text fontSize={16} fontWeight="bold" color="$chocolate">{pet.shelters?.name}</Text>
            </XStack>
            {pet.shelters?.address && (
              <XStack alignItems="center" gap="$1">
                <Feather name="map-pin" size={14} color={colors.bark} />
                <Text fontSize={13} color="$bark"> {pet.shelters?.address}</Text>
              </XStack>
            )}
            {pet.shelters?.phone && (
              <XStack alignItems="center" gap="$1">
                <Feather name="phone" size={14} color={colors.bark} />
                <Text fontSize={13} color="$bark"> {pet.shelters?.phone}</Text>
              </XStack>
            )}
          </Card>

          {pet.status === 'available' && (
            <Button
              size="$lg"
              backgroundColor="$coral"
              borderRadius="$md"
              pressStyle={{ backgroundColor: '$coralDeep' }}
              onPress={handleAdopt}
              icon={<Feather name="heart" size={18} color="white" />}
            >
              Solicitar adopción
            </Button>
          )}

          {pet.status !== 'available' && (
            <Button
              size="$lg"
              backgroundColor="$bark"
              borderRadius="$md"
              disabled
              opacity={0.7}
              icon={<Feather name={pet.status === 'pending' ? 'clock' : 'x-circle'} size={18} color="white" />}
            >
              {pet.status === 'pending' ? 'En proceso de adopción' : 'Ya adoptado'}
            </Button>
          )}

          {pet.status !== 'available' && (
            <Button
              backgroundColor="$bark"
              borderRadius="$md"
              paddingVertical="$4"
              disabled
              opacity={0.7}
              icon={<Feather name={pet.status === 'pending' ? 'clock' : 'x-circle'} size={18} color="white" />}
            >
              {'  '}{pet.status === 'pending' ? 'En proceso de adopción' : 'Ya adoptado'}
            </Button>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
