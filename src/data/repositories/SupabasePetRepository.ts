import { supabase } from '../supabase/client'
import { IPetRepository } from '../../domain/repositories/IPetRepository'
import { Pet } from '../../domain/entities/Pet'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'

export class SupabasePetRepository implements IPetRepository {
  async getShelterPets(shelterId: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*, shelters(name)')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Pet[]
  }

  async getAvailablePets(): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*, shelters(name, latitude, longitude)')
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Pet[]
  }

  async createPet(pet: Omit<Pet, 'id' | 'createdAt'>, photoUri?: string): Promise<Pet> {
    let mainPhotoUrl: string | undefined

    if (photoUri) {
      mainPhotoUrl = await this.uploadPhoto(photoUri, pet.shelterId)
    }

    const { data, error } = await supabase
      .from('pets')
      .insert({ ...pet, main_photo_url: mainPhotoUrl })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Pet
  }

  async updatePet(petId: string, updates: Partial<Pet>, newPhotoUri?: string): Promise<Pet> {
    let updateData: any = { ...updates }

    if (newPhotoUri) {
      const { data: existing } = await supabase.from('pets').select('shelter_id').eq('id', petId).single()
      updateData.main_photo_url = await this.uploadPhoto(newPhotoUri, existing!.shelter_id)
    }

    const { data, error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('id', petId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Pet
  }

  async deletePet(petId: string): Promise<void> {
    const { error } = await supabase.from('pets').delete().eq('id', petId)
    if (error) throw new Error(error.message)
  }

  private async uploadPhoto(uri: string, shelterId: string): Promise<string> {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' })
    const ext = uri.split('.').pop() ?? 'jpg'
    const filePath = `${shelterId}/${Date.now()}.${ext}`
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`

    const { error } = await supabase.storage
      .from('pets-images')
      .upload(filePath, decode(base64), { contentType, upsert: true })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('pets-images').getPublicUrl(filePath)
    return data.publicUrl
  }
}
