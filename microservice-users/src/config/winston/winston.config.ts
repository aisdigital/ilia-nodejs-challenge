import { WinstonModuleOptions } from "nest-winston";
import * as winston from "winston";
import { transports } from "winston";
import {
  ConsoleTransportOptions,
  FileTransportOptions,
} from "winston/lib/winston/transports";
import env from "../../app.env";

const winstonConfig = (overrideOptions?: any): WinstonModuleOptions => {
  const options = {
    logConsoleLevel: "warn",
    logFileActive: false,
    ...overrideOptions,
  };

  const winstonTrasports: winston.transport[] = [];

  const consoleLoggerOptions: ConsoleTransportOptions = {
    level: options.logConsoleLevel,
    format: winston.format.json(),
  };

  winstonTrasports.push(new transports.Console(consoleLoggerOptions));

  if (options.logFileActive) {
    const fileLoggerOptions: FileTransportOptions = {
      level: options.logFileLevel,
      filename: options.logFileName,
      format: winston.format.json(),
    };

    winstonTrasports.push(new transports.File(fileLoggerOptions));
  }
  return {
    transports: winstonTrasports,
    handleExceptions: true,
  };
};

const winstonTransports = winstonConfig({
  logConsoleLevel: env.LOG_CONSOLE_LEVEL,
  logFileActive: env.LOG_FILE_ACTIVE,
  logFileLevel: env.LOG_FILE_LEVEL,
  logFileName: env.LOG_FILE_NAME,
});

export default winstonTransports;
