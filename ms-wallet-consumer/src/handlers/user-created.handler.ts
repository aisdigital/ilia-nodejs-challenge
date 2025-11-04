import { DatabaseService } from '../services/database.service';

export interface UserCreatedEvent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

export class UserCreatedHandler {
  async handle(event: UserCreatedEvent): Promise<void> {
    console.log('Processing UserCreated event:', {
      userId: event.id,
      email: event.email,
      firstName: event.firstName,
      lastName: event.lastName,
    });

    const connection = await DatabaseService.getConnection();

    await connection.query(
      'INSERT INTO user_cache (id, first_name, last_name, email, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
      [event.id, event.firstName, event.lastName, event.email, event.createdAt],
    );

    console.log('User cached successfully:', event.id);
  }
}
