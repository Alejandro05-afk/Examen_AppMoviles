import { supabase } from '../supabase/client'
import { IAdoptionRepository } from '../../domain/repositories/IAdoptionRepository'
import { AdoptionRequest } from '../../domain/entities/AdoptionRequest'

type SupabaseAdoptionRequest = Record<string, any>

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

    await this.sendPushNotification(requestId, status)
  }

  private async sendPushNotification(requestId: string, status: 'accepted' | 'rejected'): Promise<void> {
    try {
      const { data: requestData } = await supabase
        .from('adoption_requests')
        .select('adopter_id, pets(name)')
        .eq('id', requestId)
        .single()

      if (!requestData) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('id', requestData.adopter_id)
        .single()

      if (!profile?.push_token) return

      const petName = (requestData.pets as any)?.name ?? 'una mascota'
      const title = status === 'accepted' ? '✅ Solicitud aceptada' : '❌ Solicitud rechazada'
      const body = status === 'accepted'
        ? `¡Felicitaciones! Tu solicitud para adoptar a ${petName} ha sido aprobada.`
        : `Tu solicitud para adoptar a ${petName} no fue aprobada en esta ocasión.`

      const functionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-push`

      await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: profile.push_token, title, body }),
      })
    } catch {
      // Silently fail - push notification is best-effort
    }
  }
}
