import { Either } from '../../../shared/either/Either';

export class UserIntegrationError extends Error {}
export class UserNotFoundIntegrationError extends UserIntegrationError {}

export type CheckUserExistsResult = Either<UserIntegrationError, boolean>;

export abstract class IUsersService {
  /**
   * Checks for the existence of a user via internal communication (gRPC)..
   * @param userId The user ID to be verified.
   * @returns Right(true) if the user exists, Left(Error) in case of failure.
   */
  abstract checkUserExists(userId: string): Promise<CheckUserExistsResult>;
}
