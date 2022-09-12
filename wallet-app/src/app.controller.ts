import { Controller, HttpStatus, Res, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Logger } from 'winston';

@Controller('/')
@ApiTags('Wallet API')
export class AppController {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  @Get()
  @ApiOperation({
    description: 'General Infos',
  })
  getInfo(@Res() res) {
    res.json({
      appName: 'Wallet API',
      env: process.env.NODE_ENV,
    });
  }
}
