import { supabase } from '../supabase/client'
import { IShelterRepository } from '../../domain/repositories/IShelterRepository'
import { Shelter } from '../../domain/entities/Shelter'

type SupabaseShelter = Record<string, any>

const toDomain = (raw: SupabaseShelter): Shelter => ({
  id: raw.id,
  profileId: raw.profile_id,
  name: raw.name,
  description: raw.description ?? undefined,
  address: raw.address ?? undefined,
  latitude: raw.latitude ?? undefined,
  longitude: raw.longitude ?? undefined,
  phone: raw.phone ?? undefined,
  logoUrl: raw.logo_url ?? undefined,
  createdAt: raw.created_at,
})

const toDomainMany = (rawList: SupabaseShelter[]): Shelter[] => rawList.map(toDomain)

export class SupabaseShelterRepository implements IShelterRepository {
  async getAllShelters(): Promise<Shelter[]> {
    const { data, error } = await supabase
      .from('shelters')
      .select('id, name, address, latitude, longitude, logo_url, phone, description, profile_id, created_at')
      .not('latitude', 'is', null)

    if (error) throw new Error(error.message)
    return toDomainMany(data ?? [])
  }

  async getShelterByProfileId(profileId: string): Promise<Shelter | null> {
    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true })
      .limit(1)

    if (error) throw new Error(error.message)
    return data?.[0] ? toDomain(data[0]) : null
  }

  async getShelterById(id: string): Promise<Shelter | null> {
    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return toDomain(data!)
  }

  async updateShelterLocation(shelterId: string, latitude: number, longitude: number): Promise<void> {
    const { error } = await supabase
      .from('shelters')
      .update({ latitude, longitude })
      .eq('id', shelterId)

    if (error) throw new Error(error.message)
  }
}
