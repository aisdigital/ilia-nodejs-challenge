import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CreateUserService } from '../user/src/modules/user/services/create-user.service';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import { HttpException } from '@nestjs/common';
import { Conflict } from 'src/http/default-body/conflict';

describe('CreateUserService', () => {
  let app: INestApplication;
  let createUserService: CreateUserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    createUserService = module.get<CreateUserService>(CreateUserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserProps = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const hashSpy = jest.spyOn(hash, 'hash');

      const saveSpy = jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        ...createUserProps,
        id: 1,
        roles: ['BASIC'], // Mock roles as needed
      });

      const result = await createUserService.create(createUserProps);

      expect(result).toEqual({
        ...createUserProps,
        id: 1,
        roles: [], // Mock roles as needed
      });

      expect(hashSpy).toHaveBeenCalledWith('password123', 8);
      expect(saveSpy).toHaveBeenCalledWith({
        ...createUserProps,
        password: expect.any(String), // bcrypt hash result
        roles: [], // Mock roles as needed
      });
    });

    it('should throw Conflict exception for existing email', async () => {
      const existingUser = {
        id: 1,
        name: 'Existing User',
        email: 'existing.user@example.com',
        password: 'hashedpassword',
        roles: [], // Mock roles as needed
      };

      jest
        .spyOn(createUserService['repository'], 'createQueryBuilder')
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValueOnce(1), // Simulate existing user
        } as any);

      await expect(
        createUserService.create(existingUser as any),
      ).rejects.toThrowError(
        new HttpException(new Conflict('Email already used'), HttpStatus.CONFLICT),
      );
    });
  });
});
