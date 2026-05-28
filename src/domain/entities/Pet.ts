export interface Pet {
  id: string
  shelterId: string
  name: string
  species: 'dog' | 'cat' | 'rabbit' | 'bird' | 'other'
  breed?: string
  ageYears: number
  ageMonths: number
  size: 'small' | 'medium' | 'large'
  gender: 'male' | 'female'
  description?: string
  isVaccinated: boolean
  isSterilized: boolean
  isDewormed: boolean
  status: 'available' | 'pending' | 'adopted'
  mainPhotoUrl?: string
  createdAt: string
  updatedAt?: string
}
