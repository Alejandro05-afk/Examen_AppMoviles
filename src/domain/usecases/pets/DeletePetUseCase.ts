import { IPetRepository } from '../../repositories/IPetRepository'

export class DeletePetUseCase {
  constructor(private petRepo: IPetRepository) {}

  async execute(petId: string) {
    return this.petRepo.deletePet(petId)
  }
}
