import { Pet } from '../entities/Pet'

export interface IPetRepository {
  getShelterPets(shelterId: string): Promise<Pet[]>
  getAvailablePets(): Promise<Pet[]>
  createPet(pet: Omit<Pet, 'id' | 'createdAt'>, photoUri?: string): Promise<Pet>
  updatePet(petId: string, updates: Partial<Pet>, newPhotoUri?: string): Promise<Pet>
  deletePet(petId: string): Promise<void>
}
