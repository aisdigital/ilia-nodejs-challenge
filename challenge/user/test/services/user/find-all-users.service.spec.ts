import { Test, TestingModule } from '@nestjs/testing';
import { FindAllUsersService } from './find-all-users.service';
import { User } from '../entities/user.entity';
import { createQueryBuilder } from 'typeorm';
import { Page } from 'src/shared/pagination/page';
import { Pageable } from 'src/shared/pagination/pageable';
import { Paginator } from 'src/shared/pagination/paginator';

describe('FindAllUsersService', () => {
  let findAllUsersService: FindAllUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FindAllUsersService],
    }).compile();

    findAllUsersService = module.get<FindAllUsersService>(FindAllUsersService);
  });

  describe('paginate', () => {
    it('should paginate users', async () => {
      const pageable: Pageable = { page: 1, size: 10 };

      const queryBuilderMock = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValueOnce([[], 0]), // Mock empty result
      };

      const createQueryBuilderSpy = jest
        .spyOn(createQueryBuilder, 'createQueryBuilder')
        .mockReturnValue(queryBuilderMock as any);

      const paginatorQuerySpy = jest.spyOn(Paginator.prototype, 'query');

      const result = await findAllUsersService.paginate(pageable);

      expect(createQueryBuilderSpy).toHaveBeenCalledWith(User, 'user');
      expect(queryBuilderMock.select).toHaveBeenCalledWith(['user.id', 'user.name', 'user.email', 'role.initials']);
      expect(queryBuilderMock.leftJoin).toHaveBeenCalledWith('user.roles', 'role');
      expect(paginatorQuerySpy).toHaveBeenCalledWith(queryBuilderMock);

      expect(result).toBeInstanceOf(Page);
      expect(result.content).toEqual([]);
      expect(result.totalElements).toBe(0);
    });
  });
});
