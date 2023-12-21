import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/repository/database/database.service';

@Injectable()
export class TransactionRepository {
  constructor(private readonly database: DatabaseService) {}
}
