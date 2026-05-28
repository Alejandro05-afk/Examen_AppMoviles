import { IPetRepository } from '../../repositories/IPetRepository'

export class UpdatePetUseCase {
  constructor(private petRepo: IPetRepository) {}

  async execute(petId: string, updates: any, newPhotoUri?: string) {
    return this.petRepo.updatePet(petId, updates, newPhotoUri)
  }
}
