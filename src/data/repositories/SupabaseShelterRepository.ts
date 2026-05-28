import { supabase } from '../supabase/client'
import { IShelterRepository } from '../../domain/repositories/IShelterRepository'
import { Shelter } from '../../domain/entities/Shelter'

export class SupabaseShelterRepository implements IShelterRepository {
  async getAllShelters(): Promise<Shelter[]> {
    const { data, error } = await supabase
      .from('shelters')
      .select('id, name, address, latitude, longitude, logo_url, phone, description, profile_id, created_at')
      .not('latitude', 'is', null)

    if (error) throw new Error(error.message)
    return data as unknown as Shelter[]
  }

  async getShelterById(id: string): Promise<Shelter | null> {
    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Shelter
  }
}
