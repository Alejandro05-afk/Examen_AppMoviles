import { Shelter } from '../entities/Shelter'

export interface IShelterRepository {
  getAllShelters(): Promise<Shelter[]>
  getShelterById(id: string): Promise<Shelter | null>
}
