import { Op } from 'sequelize';
import { IdempotencyKey } from './idempotency.model';
import { 
  IIdempotencyRepository, 
  SaveIdempotencyInput, 
  UpdateIdempotencyInput 
} from './idempotency.repository.interface';

export class IdempotencyRepository implements IIdempotencyRepository {

  async findByKey(key: string): Promise<IdempotencyKey | null> {
    return IdempotencyKey.findOne({
      where: { 
        key,
        expires_at: { [Op.gt]: new Date() }, 
      },
    });
  }

  async create(data: SaveIdempotencyInput): Promise<IdempotencyKey | null> {
    try {
      return await IdempotencyKey.create({
        key: data.key,
        user_id: data.userId,
        request_path: data.requestPath,
        request_body: data.requestBody || null,
        expires_at: data.expiresAt,
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return null;
      }
      throw error;
    }
  }

  async updateWithResponse(data: UpdateIdempotencyInput): Promise<void> {
    await IdempotencyKey.update(
      {
        response_status: data.responseStatus,
        response_body: data.responseBody,
      },
      {
        where: { key: data.key },
      }
    );
  }

  async deleteExpired(): Promise<number> {
    const result = await IdempotencyKey.destroy({
      where: {
        expires_at: { [Op.lt]: new Date() },
      },
    });
    return result;
  }
}
