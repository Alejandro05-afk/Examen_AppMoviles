import { supabase } from '../supabase/client'
import { IAdoptionRepository } from '../../domain/repositories/IAdoptionRepository'
import { AdoptionRequest } from '../../domain/entities/AdoptionRequest'

export class SupabaseAdoptionRepository implements IAdoptionRepository {
  async createRequest(petId: string, adopterId: string, shelterId: string, message: string): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .insert({ pet_id: petId, adopter_id: adopterId, shelter_id: shelterId, message })
      .select('*, pets(name, main_photo_url), profiles(full_name)')
      .single()

    if (error) throw new Error(error.message)
    return data as AdoptionRequest
  }

  async getRequestsByAdopter(adopterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, main_photo_url, species), shelters(name)')
      .eq('adopter_id', adopterId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as AdoptionRequest[]
  }

  async getRequestsByShelter(shelterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, main_photo_url), profiles!adopter_id(full_name, avatar_url, phone)')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as AdoptionRequest[]
  }

  async getRequestsByPet(petId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, main_photo_url), profiles!adopter_id(full_name, avatar_url, phone)')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as AdoptionRequest[]
  }

  async updateRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected',
    shelterResponse: string
  ): Promise<void> {
    const { error } = await supabase
      .from('adoption_requests')
      .update({ status, shelter_response: shelterResponse })
      .eq('id', requestId)

    if (error) throw new Error(error.message)

    if (status === 'accepted') {
      const { data: req } = await supabase
        .from('adoption_requests')
        .select('pet_id')
        .eq('id', requestId)
        .single()

      if (req) {
        await supabase.from('pets').update({ status: 'pending' }).eq('id', req.pet_id)
      }
    }
  }
}
