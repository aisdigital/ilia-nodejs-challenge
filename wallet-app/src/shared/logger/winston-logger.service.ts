import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  log(message: any) {
    console.debug(message);
  }

  error(message: any) {
    console.error(message);
  }

  warn(message: any) {
    console.warn(message);
  }
}
