import { IAdoptionRepository } from '../../repositories/IAdoptionRepository'

export class RejectAdoptionRequestUseCase {
  constructor(private adoptionRepo: IAdoptionRepository) {}

  async execute(requestId: string, shelterResponse: string) {
    return this.adoptionRepo.updateRequestStatus(requestId, 'rejected', shelterResponse)
  }
}
