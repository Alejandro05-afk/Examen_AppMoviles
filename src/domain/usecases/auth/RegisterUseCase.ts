import { IAuthRepository } from '../../repositories/IAuthRepository'

export class RegisterUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string, fullName: string, role: 'adopter' | 'shelter') {
    if (!email || !password || !fullName) throw new Error('Todos los campos son requeridos')
    if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')
    return this.authRepo.register(email, password, fullName, role)
  }
}
