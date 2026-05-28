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
}
