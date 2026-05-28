import { IPetRepository } from '../../repositories/IPetRepository'

export class GetAvailablePetsUseCase {
  constructor(private petRepo: IPetRepository) {}

  async execute() {
    return this.petRepo.getAvailablePets()
  }
}
