import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';

import { RepositoryModule } from '../repository/repository.module';
import { Operation } from './transaction.interface';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [TransactionService, TransactionRepository],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('TransactionService -> Create', () => {
    let payload: unknown;

    it('should function create be called', () => {
      expect(service.create(payload)).toHaveBeenCalledWith({});
    });

    describe('when an integer amount value is received', () => {
      payload = {
        user_id: '123456',
        amount: '120',
        type: Operation.DEBIT,
      };

      it('should function create return sucessfully', async () => {
        const result = await service.create(payload);
        expect(result).toBe({});
      });
    });

    describe('when a floating amount value is received', () => {
      payload = {
        user_id: '123456',
        amount: '152.24',
        type: Operation.DEBIT,
      };

      it('should function create return sucessfully', async () => {
        const result = await service.create(payload);
        expect(result).toBe({});
      });
    });

    describe('when some values of payload are missing', () => {
      it('should function create return sucessfully', async () => {
        const result = await service.create(payload);
        expect(result).toBe({});
      });
    });
  });

  describe('TransactionRepository -> findAll', () => {
    it('should function findAll be called', () => {
      expect(service.findAll()).toHaveBeenCalledWith({});
    });

    it('should function findAll return sucessfully', async () => {
      const result = await service.findAll();
      expect(result).toBe({});
    });
  });
});
