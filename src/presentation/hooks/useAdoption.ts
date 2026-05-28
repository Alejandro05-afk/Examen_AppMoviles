import { useState, useCallback } from 'react'
import {
  createAdoptionRequestUseCase,
  acceptAdoptionRequestUseCase,
  rejectAdoptionRequestUseCase,
  getAdoptionRequestsUseCase,
} from '../../di/container'

export function useAdoption() {
  const [loading, setLoading] = useState(false)

  const createRequest = useCallback(async (petId: string, adopterId: string, shelterId: string, message: string) => {
    setLoading(true)
    try {
      return await createAdoptionRequestUseCase.execute(petId, adopterId, shelterId, message)
    } finally {
      setLoading(false)
    }
  }, [])

  const acceptRequest = useCallback(async (requestId: string, response: string) => {
    await acceptAdoptionRequestUseCase.execute(requestId, response)
  }, [])

  const rejectRequest = useCallback(async (requestId: string, response: string) => {
    await rejectAdoptionRequestUseCase.execute(requestId, response)
  }, [])

  const getRequestsByAdopter = useCallback(async (adopterId: string) => {
    return getAdoptionRequestsUseCase.executeByAdopter(adopterId)
  }, [])

  const getRequestsByShelter = useCallback(async (shelterId: string) => {
    return getAdoptionRequestsUseCase.executeByShelter(shelterId)
  }, [])

  const getRequestsByPet = useCallback(async (petId: string) => {
    return getAdoptionRequestsUseCase.executeByPet(petId)
  }, [])

  return { loading, createRequest, acceptRequest, rejectRequest, getRequestsByAdopter, getRequestsByShelter, getRequestsByPet }
}
