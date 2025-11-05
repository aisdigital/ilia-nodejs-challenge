import { User } from '../entities/User';

export interface AuthToken {
  accessToken: string;
}

export abstract class IAuthService {
  /**
   * Signs and sends a JWT to the user.
   * @param user User data.
   * @returns Access token.
   */
  abstract generateToken(user: User): AuthToken;

  /**
   * Creates a hash of the password for secure storage.
   * @param password string.
   * @returns Promise<string>
   */
  abstract hashPassword(password: string): Promise<string>;

  /**
   * Compares a password to the stored hash.
   * @param password string.
   * @param hash string.
   * @returns Promise<boolean>
   */
  abstract comparePassword(password: string, hash: string): Promise<boolean>;
}
