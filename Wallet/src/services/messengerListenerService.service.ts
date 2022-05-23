import { MessengerEntityService } from '@/interfaces/messengerEntityService.interface';
import { MessengerService } from '@/interfaces/messengerService.interface';
import { getChannel } from '@/messenger';
import { Channel } from '@/messenger/messenger';

class MessengerListenerService implements MessengerService {
  // eslint-disable-next-line prettier/prettier
  constructor(private queue: string, private messengerEntityService: MessengerEntityService) { }

  public async consume() {
    const channel: Channel = getChannel();
    await channel.assertQueue(this.queue);
    await channel.consume(this.queue, (msg: any | null) => this.onMessage(channel, msg));
  }

  private async onMessage(channel: Channel, msg: any | null) {
    if (!msg) return;
    const message = JSON.parse(msg.content.toString());
    await this.messengerEntityService.insertEntity(message);
    return channel.ack(msg);
  }
}

export default MessengerListenerService;
