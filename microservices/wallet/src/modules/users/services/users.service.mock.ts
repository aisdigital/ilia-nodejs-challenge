/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Logger } from '@nestjs/common';
import {
  IUsersService,
  CheckUserExistsResult,
  UserNotFoundIntegrationError,
} from '../ports/users.service.interface';
import { Left, Right } from '../../../shared/either/Either';

@Injectable()
export class UsersServiceMock implements IUsersService {
  private readonly logger = new Logger(UsersServiceMock.name);

  private readonly VALID_USER_IDS = [
    '00000000-0000-0000-0000-000000000001',
    'b33a8c54-7123-456b-a2c3-4318c47b59e0',
  ];

  async checkUserExists(userId: string): Promise<CheckUserExistsResult> {
    this.logger.warn(`[MOCK] Integration call for UsersService. ID: ${userId}`);

    if (this.VALID_USER_IDS.includes(userId)) {
      return Right(true);
    }

    return Left(
      new UserNotFoundIntegrationError(`User with ID ${userId} not found.`),
    );
  }
}
