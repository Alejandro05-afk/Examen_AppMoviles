import { useCallback } from 'react'
import { usePetsStore } from '../store/petsStore'
import {
  getAvailablePetsUseCase,
  getShelterPetsUseCase,
  createPetUseCase,
  updatePetUseCase,
  deletePetUseCase,
} from '../../di/container'
import { Pet } from '../../domain/entities/Pet'

export function usePets() {
  const { availablePets, shelterPets, setAvailablePets, setShelterPets, addShelterPet, updatePet: updateStore, removePet } = usePetsStore()

  const fetchAvailablePets = useCallback(async () => {
    const pets = await getAvailablePetsUseCase.execute()
    setAvailablePets(pets)
    return pets
  }, [])

  const fetchShelterPets = useCallback(async (shelterId: string) => {
    const pets = await getShelterPetsUseCase.execute(shelterId)
    setShelterPets(pets)
    return pets
  }, [])

  const createPet = useCallback(async (pet: Omit<Pet, 'id' | 'createdAt'>, photoUri?: string) => {
    const newPet = await createPetUseCase.execute(pet, photoUri)
    addShelterPet(newPet)
    return newPet
  }, [])

  const updatePet = useCallback(async (petId: string, updates: Partial<Pet>, newPhotoUri?: string) => {
    const updated = await updatePetUseCase.execute(petId, updates, newPhotoUri)
    updateStore(petId, updated)
    return updated
  }, [])

  const deletePet = useCallback(async (petId: string) => {
    await deletePetUseCase.execute(petId)
    removePet(petId)
  }, [])

  return { availablePets, shelterPets, fetchAvailablePets, fetchShelterPets, createPet, updatePet, deletePet }
}
