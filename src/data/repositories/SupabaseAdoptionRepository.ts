import { supabase } from '../supabase/client'
import { IAdoptionRepository } from '../../domain/repositories/IAdoptionRepository'
import { AdoptionRequest } from '../../domain/entities/AdoptionRequest'

type SupabaseAdoptionRequest = Record<string, any>

const functionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-push`

const toDomain = (raw: SupabaseAdoptionRequest): AdoptionRequest => ({
  id: raw.id,
  petId: raw.pet_id,
  adopterId: raw.adopter_id,
  shelterId: raw.shelter_id,
  status: raw.status,
  message: raw.message ?? undefined,
  shelterResponse: raw.shelter_response ?? undefined,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  petName: (raw.pets as any)?.name ?? undefined,
  petPhoto: (raw.pets as any)?.main_photo_url ?? undefined,
  adopterName: (raw.profiles as any)?.full_name ?? raw.adopters?.full_name ?? undefined,
  adopterAvatar: (raw.profiles as any)?.avatar_url ?? raw.adopters?.avatar_url ?? undefined,
  adopterPhone: (raw.profiles as any)?.phone ?? raw.adopters?.phone ?? undefined,
  shelterName: (raw.shelters as any)?.name ?? undefined,
})

const toDomainMany = (rawList: SupabaseAdoptionRequest[]): AdoptionRequest[] => rawList.map(toDomain)

export class SupabaseAdoptionRepository implements IAdoptionRepository {
  async createRequest(petId: string, adopterId: string, shelterId: string, message: string): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .insert({ pet_id: petId, adopter_id: adopterId, shelter_id: shelterId, message })
      .select('*, pets(name, main_photo_url), profiles(full_name)')
      .single()

    if (error) throw new Error(error.message)

    try {
      await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'adoption_request', requestId: data!.id }),
      })
    } catch {
      // Silently fail
    }
    return toDomain(data!)
  }

  async getRequestsByAdopter(adopterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, main_photo_url, species), shelters(name)')
      .eq('adopter_id', adopterId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return toDomainMany(data ?? [])
  }

  async getRequestsByShelter(shelterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, main_photo_url), profiles!adopter_id(full_name, avatar_url, phone)')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return toDomainMany(data ?? [])
  }

  async getRequestsByPet(petId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, main_photo_url), profiles!adopter_id(full_name, avatar_url, phone)')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return toDomainMany(data ?? [])
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

    try {
      await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status_update', requestId, status }),
      })
    } catch {
      // Silently fail
    }
  }
}
