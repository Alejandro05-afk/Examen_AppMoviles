import { IPetRepository } from '../../repositories/IPetRepository'

export class GetShelterPetsUseCase {
  constructor(private petRepo: IPetRepository) {}

  async execute(shelterId: string) {
    return this.petRepo.getShelterPets(shelterId)
  }
}
