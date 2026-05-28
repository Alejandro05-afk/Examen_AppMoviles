import { IAdoptionRepository } from '../../repositories/IAdoptionRepository'

export class GetAdoptionRequestsUseCase {
  constructor(private adoptionRepo: IAdoptionRepository) {}

  async executeByAdopter(adopterId: string) {
    return this.adoptionRepo.getRequestsByAdopter(adopterId)
  }

  async executeByShelter(shelterId: string) {
    return this.adoptionRepo.getRequestsByShelter(shelterId)
  }

  async executeByPet(petId: string) {
    return this.adoptionRepo.getRequestsByPet(petId)
  }
}
