import { Shelter } from '../entities/Shelter'

export interface IShelterRepository {
  getAllShelters(): Promise<Shelter[]>
  getShelterById(id: string): Promise<Shelter | null>
  getShelterByProfileId(profileId: string): Promise<Shelter | null>
  updateShelterLocation(shelterId: string, latitude: number, longitude: number): Promise<void>
}
