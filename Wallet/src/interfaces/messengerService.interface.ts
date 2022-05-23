export interface MessengerService {
  consume(): Promise<void>;
}
