import { SupabaseAuthRepository } from '../data/repositories/SupabaseAuthRepository'
import { SupabasePetRepository } from '../data/repositories/SupabasePetRepository'
import { SupabaseAdoptionRepository } from '../data/repositories/SupabaseAdoptionRepository'
import { SupabaseShelterRepository } from '../data/repositories/SupabaseShelterRepository'
import { GeminiDataSource } from '../data/datasources/GeminiDataSource'

import { LoginUseCase } from '../domain/usecases/auth/LoginUseCase'
import { RegisterUseCase } from '../domain/usecases/auth/RegisterUseCase'
import { LoginWithGoogleUseCase } from '../domain/usecases/auth/LoginWithGoogleUseCase'
import { ResetPasswordUseCase } from '../domain/usecases/auth/ResetPasswordUseCase'
import { CreatePetUseCase } from '../domain/usecases/pets/CreatePetUseCase'
import { GetShelterPetsUseCase } from '../domain/usecases/pets/GetShelterPetsUseCase'
import { UpdatePetUseCase } from '../domain/usecases/pets/UpdatePetUseCase'
import { DeletePetUseCase } from '../domain/usecases/pets/DeletePetUseCase'
import { GetAvailablePetsUseCase } from '../domain/usecases/pets/GetAvailablePetsUseCase'
import { CreateAdoptionRequestUseCase } from '../domain/usecases/adoption/CreateAdoptionRequestUseCase'
import { AcceptAdoptionRequestUseCase } from '../domain/usecases/adoption/AcceptAdoptionRequestUseCase'
import { RejectAdoptionRequestUseCase } from '../domain/usecases/adoption/RejectAdoptionRequestUseCase'
import { GetAdoptionRequestsUseCase } from '../domain/usecases/adoption/GetAdoptionRequestsUseCase'
import { SendAIMessageUseCase } from '../domain/usecases/ai/SendAIMessageUseCase'
import { GetNearbySheltersUseCase } from '../domain/usecases/shelters/GetNearbySheltersUseCase'

const authRepo = new SupabaseAuthRepository()
const petRepo = new SupabasePetRepository()
const adoptionRepo = new SupabaseAdoptionRepository()
export const shelterRepo = new SupabaseShelterRepository()
const geminiDS = new GeminiDataSource()

export const loginUseCase = new LoginUseCase(authRepo)
export const registerUseCase = new RegisterUseCase(authRepo)
export const loginWithGoogleUseCase = new LoginWithGoogleUseCase(authRepo)
export const resetPasswordUseCase = new ResetPasswordUseCase(authRepo)

export const createPetUseCase = new CreatePetUseCase(petRepo)
export const getShelterPetsUseCase = new GetShelterPetsUseCase(petRepo)
export const updatePetUseCase = new UpdatePetUseCase(petRepo)
export const deletePetUseCase = new DeletePetUseCase(petRepo)
export const getAvailablePetsUseCase = new GetAvailablePetsUseCase(petRepo)

export const createAdoptionRequestUseCase = new CreateAdoptionRequestUseCase(adoptionRepo)
export const acceptAdoptionRequestUseCase = new AcceptAdoptionRequestUseCase(adoptionRepo)
export const rejectAdoptionRequestUseCase = new RejectAdoptionRequestUseCase(adoptionRepo)
export const getAdoptionRequestsUseCase = new GetAdoptionRequestsUseCase(adoptionRepo)

export const sendAIMessageUseCase = new SendAIMessageUseCase(geminiDS)

export const getNearbySheltersUseCase = new GetNearbySheltersUseCase(shelterRepo)
