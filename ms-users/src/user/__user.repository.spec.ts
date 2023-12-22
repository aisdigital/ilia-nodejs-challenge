import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { RepositoryModule } from '../repository/repository.module';

describe('UserRepository', () => {
  let service: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [UserRepository],
    }).compile();

    service = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
