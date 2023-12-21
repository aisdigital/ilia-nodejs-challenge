import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../repository/database/database.service';
import { Operation } from '@prisma/client';

@Injectable()
export class BalanceRepository {
  constructor(private readonly database: DatabaseService) { }

  async getBalance(): Promise<BalanceReport> {
    const result = await this.database.transaction.groupBy({
      by: ['type'],
      _sum: {
        amount: true,
      },
    });

    return this.formatBalance(result);
  }

  private formatBalance(balance): BalanceReport {
    const report: BalanceReport = {
      credit: 0,
      debit: 0,
    };
    balance.forEach((group) => {
      if (group.type === Operation.CREDIT) {
        report.credit = group._sum.amount || 0;
      }

      if (group.type === Operation.DEBIT) {
        report.debit = group._sum.amount || 0;
      }
    });

    return report;
  }
}
