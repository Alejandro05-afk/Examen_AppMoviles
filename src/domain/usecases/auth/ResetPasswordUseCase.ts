import { IAuthRepository } from '../../repositories/IAuthRepository'

export class ResetPasswordUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string) {
    if (!email) throw new Error('Email es requerido')
    return this.authRepo.resetPassword(email)
  }
}
