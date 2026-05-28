import { IShelterRepository } from '../../repositories/IShelterRepository'

export class GetNearbySheltersUseCase {
  constructor(private shelterRepo: IShelterRepository) {}

  async execute() {
    return this.shelterRepo.getAllShelters()
  }
}
