import { supabase } from '../supabase/client'
import { IPetRepository } from '../../domain/repositories/IPetRepository'
import { Pet } from '../../domain/entities/Pet'
import { File } from 'expo-file-system'

type SupabasePet = Record<string, any>

const toDomain = (raw: SupabasePet): Pet => ({
  id: raw.id,
  shelterId: raw.shelter_id,
  name: raw.name,
  species: raw.species,
  breed: raw.breed ?? undefined,
  ageYears: raw.age_years ?? 0,
  ageMonths: raw.age_months ?? 0,
  size: raw.size,
  gender: raw.gender,
  description: raw.description ?? undefined,
  isVaccinated: raw.is_vaccinated ?? false,
  isSterilized: raw.is_sterilized ?? false,
  isDewormed: raw.is_dewormed ?? false,
  status: raw.status,
  mainPhotoUrl: raw.main_photo_url ?? undefined,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
})

const toSupabase = (pet: Partial<Pet>): Record<string, any> => {
  const raw: Record<string, any> = {}
  if (pet.id !== undefined) raw.id = pet.id
  if (pet.shelterId !== undefined) raw.shelter_id = pet.shelterId
  if (pet.name !== undefined) raw.name = pet.name
  if (pet.species !== undefined) raw.species = pet.species
  if (pet.breed !== undefined) raw.breed = pet.breed
  if (pet.ageYears !== undefined) raw.age_years = pet.ageYears
  if (pet.ageMonths !== undefined) raw.age_months = pet.ageMonths
  if (pet.size !== undefined) raw.size = pet.size
  if (pet.gender !== undefined) raw.gender = pet.gender
  if (pet.description !== undefined) raw.description = pet.description
  if (pet.isVaccinated !== undefined) raw.is_vaccinated = pet.isVaccinated
  if (pet.isSterilized !== undefined) raw.is_sterilized = pet.isSterilized
  if (pet.isDewormed !== undefined) raw.is_dewormed = pet.isDewormed
  if (pet.status !== undefined) raw.status = pet.status
  if (pet.mainPhotoUrl !== undefined) raw.main_photo_url = pet.mainPhotoUrl
  return raw
}

const toDomainMany = (rawList: SupabasePet[]): Pet[] => rawList.map(toDomain)

const getImageExtension = (file: File, uri: string) => {
  const extension = file.extension || uri.split('?')[0].split('#')[0].split('.').pop() || 'jpg'
  const normalized = extension.replace('.', '').toLowerCase()
  return ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(normalized) ? normalized : 'jpg'
}

export class SupabasePetRepository implements IPetRepository {
  async getShelterPets(shelterId: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*, shelters(name)')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return toDomainMany(data ?? [])
  }

  async getAvailablePets(): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*, shelters(name, latitude, longitude)')
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return toDomainMany(data ?? [])
  }

  async createPet(pet: Omit<Pet, 'id' | 'createdAt'>, photoUri?: string): Promise<Pet> {
    if (photoUri) {
      pet.mainPhotoUrl = await this.uploadPhoto(photoUri, pet.shelterId)
    }

    const { data, error } = await supabase
      .from('pets')
      .insert(toSupabase(pet))
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toDomain(data!)
  }

  async updatePet(petId: string, updates: Partial<Pet>, newPhotoUri?: string): Promise<Pet> {
    const dbUpdates = toSupabase(updates)

    if (newPhotoUri) {
      const { data: existing } = await supabase.from('pets').select('shelter_id').eq('id', petId).single()
      const photoUrl = await this.uploadPhoto(newPhotoUri, existing!.shelter_id)
      dbUpdates.main_photo_url = photoUrl
    }

    const { data, error } = await supabase
      .from('pets')
      .update(dbUpdates)
      .eq('id', petId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toDomain(data!)
  }

  async deletePet(petId: string): Promise<void> {
    const { error } = await supabase.from('pets').delete().eq('id', petId)
    if (error) throw new Error(error.message)
  }

  private async uploadPhoto(uri: string, shelterId: string): Promise<string> {
    const file = new File(uri)
    const bytes = await file.arrayBuffer()
    const ext = getImageExtension(file, uri)
    const filePath = `${shelterId}/${Date.now()}.${ext}`
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`

    const { error } = await supabase.storage
      .from('pets-images')
      .upload(filePath, bytes, { contentType, upsert: true })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('pets-images').getPublicUrl(filePath)
    return data.publicUrl
  }
}
