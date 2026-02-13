/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import {
  IUsersService,
  CheckUserExistsResult,
  UserIntegrationError,
} from '../ports/users.service.interface';
import { Right, Left } from '../../../shared/either/Either';
import { join } from 'path';
import { Observable } from 'rxjs';

interface UsersInternalService {
  checkUserExists(
    data: { userId: string },
    metadata: any,
  ): Observable<{ exists: boolean }>;
}

@Injectable()
export class UsersGrpcAdapter implements IUsersService {
  private readonly logger = new Logger(UsersGrpcAdapter.name);
  private usersService: UsersInternalService;

  @microservices.Client({
    transport: microservices.Transport.GRPC,
    options: {
      package: 'users_internal',
      protoPath: join(__dirname, '../../../shared/grpc/users.proto'),
      url: process.env.USERS_GRPC_URL || 'users_app:50051',
      loader: {
        keepCase: true,
      },
    },
  })
  private readonly client: microservices.ClientGrpc;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.usersService = this.client.getService<UsersInternalService>(
      'UsersInternalService',
    );
  }

  async checkUserExists(userId: string): Promise<CheckUserExistsResult> {
    const jwtInternalSecret = this.configService.get('JWT_SECRET_INTERNAL');

    try {
      const result = await this.usersService
        .checkUserExists({ userId }, { authorization: `Bearer ${jwtInternalSecret}` })
        .toPromise();

      if (result?.exists) {
        return Right(true);
      }
      return Left(
        new UserIntegrationError(`User with ID ${userId} not found.`),
      );
    } catch (error) {
      this.logger.error('gRPC communication error with Users:', error.message);
      return Left(
        new UserIntegrationError(`gRPC communication failed: ${error.message}`),
      );
    }
  }
}
