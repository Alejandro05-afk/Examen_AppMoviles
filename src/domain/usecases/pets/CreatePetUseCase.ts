import { IPetRepository } from '../../repositories/IPetRepository'
import { Pet } from '../../entities/Pet'

export class CreatePetUseCase {
  constructor(private petRepo: IPetRepository) {}

  async execute(pet: Omit<Pet, 'id' | 'createdAt'>, photoUri?: string) {
    if (!pet.name) throw new Error('El nombre es requerido')
    return this.petRepo.createPet(pet, photoUri)
  }
}
