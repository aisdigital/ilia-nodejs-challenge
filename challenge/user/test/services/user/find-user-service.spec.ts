import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FindUserService } from './find-user.service';
import { User } from '../entities/user.entity';
import { createQueryBuilder } from 'typeorm';

describe('FindUserService', () => {
  let findUserService: FindUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FindUserService],
    }).compile();

    findUserService = module.get<FindUserService>(FindUserService);
  });

  describe('find', () => {
    it('should find and return a user by ID', async () => {
      const userId = 1;

      const userMock: User = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        roles: ['BASIC'],
      };

      const queryBuilderMock = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(userMock),
      };

      const createQueryBuilderSpy = jest
        .spyOn(createQueryBuilder, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as never);

      const result = await findUserService.find(userId);

      expect(createQueryBuilderSpy).toHaveBeenCalledWith(User, 'user');
      expect(queryBuilderMock.leftJoin).toHaveBeenCalledWith('user.roles', 'role');
      expect(queryBuilderMock.select).toHaveBeenCalledWith(['user.id', 'user.name', 'user.email', 'role.initials']);
      expect(queryBuilderMock.where).toHaveBeenCalledWith('user.id = :user_id', { user_id: userId });
      expect(queryBuilderMock.getOne).toHaveBeenCalled();

      expect(result).toEqual(userMock);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 1;

      const queryBuilderMock = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(null), // Simulate user not found
      };

      jest.spyOn(createQueryBuilder, 'createQueryBuilder').mockReturnValue(queryBuilderMock as never);

      await expect(findUserService.find(userId)).rejects.toThrowError(
        new NotFoundException('resource not found'),
      );

      expect(queryBuilderMock.leftJoin).toHaveBeenCalledWith('user.roles', 'role');
      expect(queryBuilderMock.select).toHaveBeenCalledWith(['user.id', 'user.name', 'user.email', 'role.initials']);
      expect(queryBuilderMock.where).toHaveBeenCalledWith('user.id = :user_id', { user_id: userId });
      expect(queryBuilderMock.getOne).toHaveBeenCalled();
    });
  });
});
