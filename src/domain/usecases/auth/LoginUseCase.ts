import { IAuthRepository } from '../../repositories/IAuthRepository'
import { User } from '../../entities/User'

export class LoginUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    if (!email || !password) throw new Error('Email y contraseña son requeridos')
    return this.authRepo.login(email, password)
  }
}
