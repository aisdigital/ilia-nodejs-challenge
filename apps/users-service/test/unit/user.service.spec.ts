import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../../src/modules/user/user.service';
import { User } from '../../src/modules/user/entities/user.entity';

const mockUser: User = {
  id: 'user-1',
  first_name: 'Maria',
  last_name: 'Silva',
  email: 'maria@email.com',
  password: 'secret',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(UserService);
    repository = moduleRef.get(getRepositoryToken(User));
  });

  it('creates a user', async () => {
    const result = await service.create({
      first_name: 'Maria',
      last_name: 'Silva',
      email: 'maria@email.com',
      password: 'secret',
    });

    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('returns all users', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockUser]);
  });

  it('returns a user by id', async () => {
    const result = await service.findOne('user-1');
    expect(result).toEqual(mockUser);
  });
});
