import { IShelterRepository } from '../../repositories/IShelterRepository'

export class GetNearbySheltersUseCase {
  constructor(private shelterRepo: IShelterRepository) {}

  async execute(latitude: number, longitude: number, maxDistanceKm = 50) {
    const shelters = await this.shelterRepo.getAllShelters()

    return shelters
      .filter((shelter) => shelter.latitude != null && shelter.longitude != null)
      .map((shelter) => ({
        ...shelter,
        distanceKm: this.distanceKm(
          latitude,
          longitude,
          shelter.latitude as number,
          shelter.longitude as number
        ),
      }))
      .filter((shelter) => shelter.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }

  private distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (value: number) => (value * Math.PI) / 180
    const earthRadiusKm = 6371
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2
    return 2 * earthRadiusKm * Math.asin(Math.sqrt(a))
  }
}
