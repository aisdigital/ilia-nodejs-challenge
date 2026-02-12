import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserService } from './delete-user.service';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { createQueryBuilder } from 'typeorm';
import { Authorized } from 'src/modules/authentication/models/authorized';

describe('DeleteUserService', () => {
  let deleteUserService: DeleteUserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    deleteUserService = module.get<DeleteUserService>(DeleteUserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('delete', () => {
    it('should delete user when authorized', async () => {
      const authorizedMock: Authorized = {
        isMeOrImADM: jest.fn().mockReturnValue(true),
      };

      const userMock: User = {
        id: 1,
        email: 'john.doe@example.com',
        roles: ['BASIC'],
      };

      const findUserSpy = jest
        .spyOn(createQueryBuilder(User, 'user'), 'leftJoin')
        .mockReturnThis()
        .mockReturnThis()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValueOnce(userMock),
        } as any);

      const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValueOnce();
      const softDeleteSpy = jest.spyOn(userRepository, 'softDelete').mockResolvedValueOnce();

      await deleteUserService.delete(1, authorizedMock);

      expect(findUserSpy).toHaveBeenCalledWith('user.roles', 'role');
      expect(findUserSpy).toHaveBeenCalledWith('user.id = :user_id', { user_id: 1 });

      expect(updateSpy).toHaveBeenCalledWith(1, {
        active: false,
        email: null,
        deletedEmail: 'john.doe@example.com',
      });

      expect(softDeleteSpy).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException if not authorized', async () => {
      const authorizedMock: Authorized = {
        isMeOrImADM: jest.fn().mockReturnValue(false),
      };

      await expect(deleteUserService.delete(1, authorizedMock)).rejects.toThrowError(
        new UnauthorizedException('Not authorized to delete user'),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const authorizedMock: Authorized = {
        isMeOrImADM: jest.fn().mockReturnValue(true),
      };

      const findUserSpy = jest
        .spyOn(createQueryBuilder(User, 'user'), 'leftJoin')
        .mockReturnThis()
        .mockReturnThis()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValueOnce(null),
        } as any);

      await expect(deleteUserService.delete(1, authorizedMock)).rejects.toThrowError(
        new NotFoundException('resource not found'),
      );

      expect(findUserSpy).toHaveBeenCalledWith('user.roles', 'role');
      expect(findUserSpy).toHaveBeenCalledWith('user.id = :user_id', { user_id: 1 });
    });
  });
});
