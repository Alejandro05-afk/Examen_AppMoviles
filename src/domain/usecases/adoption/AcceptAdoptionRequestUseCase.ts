import { IAdoptionRepository } from '../../repositories/IAdoptionRepository'

export class AcceptAdoptionRequestUseCase {
  constructor(private adoptionRepo: IAdoptionRepository) {}

  async execute(requestId: string, shelterResponse: string) {
    return this.adoptionRepo.updateRequestStatus(requestId, 'accepted', shelterResponse)
  }
}
