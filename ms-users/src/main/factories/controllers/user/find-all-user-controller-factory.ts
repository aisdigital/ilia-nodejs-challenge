import { Controller } from '../../../../infra/api'

import { UserRepository } from '../../../../infra/db/repository/user-repository'
import { UserImplementation } from '../../../../domain/implementation/user-implementation'
import { FindAllUsersController } from '../../../../infra/api/controllers'

export const makeFindAllUserController = (): Controller => {
  const repository = new UserRepository()
  const entity = new UserImplementation(repository)
  return new FindAllUsersController(entity)
}