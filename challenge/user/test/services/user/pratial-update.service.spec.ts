import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PartialUpdateUserService } from './partial-update-user.service';
import { User } from '../entities/user.entity';
import { Repository, createQueryBuilder } from 'typeorm';
import { DeepPartial, Equal } from 'typeorm';
import { PartialUpdateUser } from '../dtos/partial-update-user';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PartialUpdateUserService', () => {
  let partialUpdateUserService: PartialUpdateUserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartialUpdateUserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    partialUpdateUserService = module.get<PartialUpdateUserService>(PartialUpdateUserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('update', () => {
    it('should partially update user', async () => {
      const userId = 1;
      const partialUpdate: PartialUpdateUser = {
        name: 'New Name',
      };

      const userMock: User = {
        id: userId,
        name: 'Old Name',
        email: 'old.name@example.com',
        roles: [], // Mock roles as needed
      };

      const queryBuilderMock = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(userMock),
      };

      const createQueryBuilderSpy = jest
        .spyOn(createQueryBuilder, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as never);

      const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValueOnce();

      const updated = await partialUpdateUserService.update(userId, partialUpdate);

      expect(createQueryBuilderSpy).toHaveBeenCalledWith(User, 'user');
      expect(queryBuilderMock.select).toHaveBeenCalledWith(['user.id']);
      expect(queryBuilderMock.where).toHaveBeenCalledWith('user.id = :user_id', { user_id: userId });
      expect(queryBuilderMock.getOne).toHaveBeenCalled();

      expect(updateSpy).toHaveBeenCalledWith(
        {
          id: Equal(userId),
        },
        {
          name: 'New Name',
        },
      );

      expect(updated).toEqual({
        id: userId,
        name: 'New Name',
        email: 'old.name@example.com', // Email remains unchanged
        roles: [], // Mock roles as needed
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 1;
      const partialUpdate: PartialUpdateUser = {
        name: 'New Name',
      };

      const queryBuilderMock = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(null), // Simulate user not found
      };

      jest.spyOn(createQueryBuilder, 'createQueryBuilder').mockReturnValue(queryBuilderMock as never);

      await expect(partialUpdateUserService.update(userId, partialUpdate)).rejects.toThrowError(
        new NotFoundException('resource not found'),
      );

      expect(queryBuilderMock.select).toHaveBeenCalledWith(['user.id']);
      expect(queryBuilderMock.where).toHaveBeenCalledWith('user.id = :user_id', { user_id: userId });
      expect(queryBuilderMock.getOne).toHaveBeenCalled();
    });
  });
});
