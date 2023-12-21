import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';

import { RepositoryModule } from '../repository/repository.module';
import { Operation } from './transaction.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';

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
    let payload: CreateTransactionDto;

    describe('when an integer amount value is received', () => {
      it('should function create return sucessfully', async () => {
        payload = {
          user_id: '123456',
          amount: 120,
          type: Operation.DEBIT,
        };
        const result = await service.create(payload);

        expect(result.user_id).toEqual('123456');
        expect(result.amount).toEqual(120);
        expect(result.type).toEqual(Operation.DEBIT);
      });
    });

    describe('when a floating amount value is received', () => {
      it('should function create return sucessfully', async () => {
        payload = {
          user_id: '123456',
          amount: 152.24,
          type: Operation.CREDIT,
        };

        const result = await service.create(payload);

        expect(result.user_id).toEqual('123456');
        expect(result.amount).toEqual(152);
        expect(result.type).toEqual(Operation.CREDIT);
      });
    });
  });

  describe.skip('TransactionRepository -> findAll', () => {
    it('should function findAll be called', () => {
      expect(service.findAll()).toHaveBeenCalledWith({});
    });

    it('should function findAll return sucessfully', async () => {
      const result = await service.findAll();
      expect(result).toBe({});
    });
  });
});
