import { IAuthRepository } from '../../repositories/IAuthRepository'

export class LoginWithGoogleUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute() {
    return this.authRepo.loginWithGoogle()
  }
}
