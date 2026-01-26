import { Test } from '@nestjs/testing';
import { UserController } from '../../src/modules/user/user.controller';
import { UserService } from '../../src/modules/user/user.service';

const mockUser = {
  id: 'user-1',
  first_name: 'Maria',
  last_name: 'Silva',
  email: 'maria@email.com',
  password: 'secret',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findAll: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(mockUser),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(UserController);
    service = moduleRef.get(UserService);
  });

  it('creates a user', async () => {
    const result = await controller.create({
      first_name: 'Maria',
      last_name: 'Silva',
      email: 'maria@email.com',
      password: 'secret',
    });

    expect(service.create).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('returns all users', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockUser]);
  });
});
