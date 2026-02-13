/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { IUserRepository } from '../../domain/repository/IUserRepository';
import * as users from '../../../../shared/grpc/generated/users';

@Controller()
export class UsersGrpcServerService {
  private readonly logger = new Logger(UsersGrpcServerService.name);

  constructor(private readonly userRepository: IUserRepository) {}

  @GrpcMethod('UsersInternalService', 'CheckUserExists')
  async checkUserExists(
    data: users.CheckUserExistsRequest,
  ): Promise<users.CheckUserExistsResponse> {
    this.logger.log(`gRPC CheckUserExists called for userId: ${data.userId}`);
    const exists = await this.userRepository.exists(data.userId);
    return { exists: exists };
  }
}
