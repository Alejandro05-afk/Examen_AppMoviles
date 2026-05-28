import { AdoptionRequest } from '../entities/AdoptionRequest'

export interface IAdoptionRepository {
  createRequest(petId: string, adopterId: string, shelterId: string, message: string): Promise<AdoptionRequest>
  getRequestsByAdopter(adopterId: string): Promise<AdoptionRequest[]>
  getRequestsByShelter(shelterId: string): Promise<AdoptionRequest[]>
  getRequestsByPet(petId: string): Promise<AdoptionRequest[]>
  updateRequestStatus(requestId: string, status: 'accepted' | 'rejected', shelterResponse: string): Promise<void>
}
