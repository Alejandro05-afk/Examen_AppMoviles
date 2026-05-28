import { IAdoptionRepository } from '../../repositories/IAdoptionRepository'

export class CreateAdoptionRequestUseCase {
  constructor(private adoptionRepo: IAdoptionRepository) {}

  async execute(petId: string, adopterId: string, shelterId: string, message: string) {
    if (!petId || !adopterId || !shelterId) throw new Error('Datos incompletos')
    return this.adoptionRepo.createRequest(petId, adopterId, shelterId, message)
  }
}
