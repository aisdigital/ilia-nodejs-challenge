import { User } from '@interfaces/users.interface';
import { Channel } from 'amqplib';
import { getChannel } from '@/messenger';
import { mapUserMessenger } from '@/mapper/UserMessenger.mapper';
import { MessengerService } from '@/interfaces/messengerService.interface';

class MessengerUserService implements MessengerService {
  readonly queue = 'users';

  public async publish(user: User) {
    const channel: Channel = getChannel();
    await channel.assertQueue(this.queue);
    this.sendMessages(channel, this.queue, user);
  }

  private async sendMessages(channel: Channel, queue: string, user: User) {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(mapUserMessenger(user))));
  }
}

export default MessengerUserService;
