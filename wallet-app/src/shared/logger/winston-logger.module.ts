import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import winston = require('winston');
import { WinstonLoggerService } from './winston-logger.service';

const format = winston.format.printf(
  ({ level, message, label, timestamp, ms }) => {
    return `${timestamp} ${label ? [label] : ''} ${level}: ${message} ${ms}`;
  },
);

const colorize = winston.format.colorize({
  all: true,
  colors: {
    timestamp: 'yellow',
    error: 'red',
    warn: 'yellow',
    info: 'white',
    http: 'green',
    sql: 'blue',
    debug: 'green',
  },
});

@Module({
  imports: [
    WinstonModule.forRoot({
      // level: 'debug',
      levels: winston.config.npm.levels,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.align(),
        winston.format.ms(),
        winston.format.splat(),
        colorize,
        format,
      ),
      transports: [new winston.transports.Console()],
      exitOnError: false,
    }),
  ],
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class WinstonLoggerModule {}
