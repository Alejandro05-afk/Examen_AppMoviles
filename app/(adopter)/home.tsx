import { useEffect, useState } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { YStack, XStack, Text, Button, Card, Image, Input } from 'tamagui'
import { useRouter, Link } from 'expo-router'
import LottieView from 'lottie-react-native'
import { usePets } from '../../src/presentation/hooks/usePets'

export default function HomeScreen() {
  const router = useRouter()
  const { availablePets, fetchAvailablePets } = usePets()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAvailablePets().finally(() => setLoading(false))
  }, [])

  const filteredPets = availablePets.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.species.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: 100, height: 100 }} />
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack padding="$3" gap="$2">
        <Input flex={1} placeholder="Buscar mascotas..." value={search}
          onChangeText={setSearch} />
        <Link href="/(adopter)/map" asChild>
          <Button background="$primary">📍</Button>
        </Link>
        <Link href="/(adopter)/ai-chat" asChild>
          <Button background="$primary">🤖</Button>
        </Link>
      </XStack>

      <FlatList
        data={filteredPets}
        keyExtractor={p => p.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        ListEmptyComponent={
          <YStack alignItems="center" justifyContent="center" mt={60} gap="$4">
            <LottieView source={require('../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: 180, height: 180 }} />
            <Text color="$color">No hay mascotas disponibles aún</Text>
          </YStack>
        }
        renderItem={({ item }) => (
          <Card flex={1} borderRadius={12} elevation={2} overflow="hidden"
            onPress={() => router.push(`/(adopter)/pet/${item.id}` as any)}
            pressStyle={{ opacity: 0.8 }}>
            <Image
              source={{ uri: item.mainPhotoUrl || 'https://placehold.co/200x200/e2e8f0/a1a1aa?text=🐾' }}
              style={{ width: '100%', height: 150 }}
            />
            <YStack padding="$2" gap="$1">
              <Text fontWeight="bold" fontSize={14}>{item.name}</Text>
              <XStack gap="$1">
                <Text fontSize={11} color="$color" textTransform="capitalize">
                  {item.species}
                </Text>
                {item.breed && (
                  <Text fontSize={11} color="$color">· {item.breed}</Text>
                )}
              </XStack>
            </YStack>
          </Card>
        )}
      />

      <XStack justifyContent="space-around" padding="$3" borderTopWidth={1} borderTopColor="$borderColor">
        <Link href="/(adopter)/home" asChild><Button flex={1} background="$primary" size="$3">🏠</Button></Link>
        <Link href="/(adopter)/my-requests" asChild><Button flex={1} variant="outlined" size="$3">📋</Button></Link>
        <Link href="/(adopter)/ai-chat" asChild><Button flex={1} variant="outlined" size="$3">🤖</Button></Link>
        <Link href="/(adopter)/map" asChild><Button flex={1} variant="outlined" size="$3">📍</Button></Link>
      </XStack>
    </YStack>
  )
}
