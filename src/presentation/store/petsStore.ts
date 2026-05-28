import { create } from 'zustand'
import { Pet } from '../../domain/entities/Pet'

interface PetsState {
  availablePets: Pet[]
  shelterPets: Pet[]
  setAvailablePets: (pets: Pet[]) => void
  setShelterPets: (pets: Pet[]) => void
  addShelterPet: (pet: Pet) => void
  updatePet: (petId: string, updates: Partial<Pet>) => void
  removePet: (petId: string) => void
}

export const usePetsStore = create<PetsState>((set) => ({
  availablePets: [],
  shelterPets: [],
  setAvailablePets: (pets) => set({ availablePets: pets }),
  setShelterPets: (pets) => set({ shelterPets: pets }),
  addShelterPet: (pet) => set((state) => ({ shelterPets: [pet, ...state.shelterPets] })),
  updatePet: (petId, updates) => set((state) => ({
    shelterPets: state.shelterPets.map(p => p.id === petId ? { ...p, ...updates } : p),
    availablePets: state.availablePets.map(p => p.id === petId ? { ...p, ...updates } : p),
  })),
  removePet: (petId) => set((state) => ({
    shelterPets: state.shelterPets.filter(p => p.id !== petId),
    availablePets: state.availablePets.filter(p => p.id !== petId),
  })),
}))
