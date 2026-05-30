export interface AdoptionRequest {
  id: string
  petId: string
  adopterId: string
  shelterId: string
  status: 'pending' | 'accepted' | 'rejected'
  message?: string
  shelterResponse?: string
  createdAt: string
  updatedAt?: string
  petName?: string
  petPhoto?: string
  adopterName?: string
  adopterAvatar?: string
  adopterPhone?: string
  shelterName?: string
}
