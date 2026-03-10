import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('mevo')
export class MevoController {
  constructor(private configService: ConfigService) {}

  @Post('webhook')
  @HttpCode(201)
  receiveWebhook(@Headers('authorization') auth: string, @Body() body: any) {
    if (!auth) {
      throw new UnauthorizedException('Authorization ausente');
    }

    const bearerToken = this.configService.get<string>('MEVO_BEARER');
    const basicToken = this.configService.get<string>('MEVO_BASIC');

    if (auth.startsWith('Bearer ')) {
      const token = auth.replace('Bearer ', '');

      if (token !== bearerToken) {
        throw new UnauthorizedException('Bearer token inválido');
      }
    } else if (auth.startsWith('Basic ')) {
      const token = auth.replace('Basic ', '');

      if (token !== basicToken) {
        throw new UnauthorizedException('Basic token inválido');
      }
    } else {
      throw new UnauthorizedException('Tipo de autorização não suportado');
    }

    console.log('Webhook MEVO recebido');
    console.log(JSON.stringify(body, null, 2));

    return { status: 'received' };
  }
}
