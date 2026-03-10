import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';

@Controller('mevo')
export class MevoController {
  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {}

  // Função para validar o token
  private validarAutorizacao(auth: string) {
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
  }

  @Post('receita')
  @HttpCode(201)
  async receberReceita(
    @Headers('authorization') auth: string,
    @Body() body: any,
  ) {
    this.validarAutorizacao(auth);

    const connection = await this.databaseService.getConnection();

    try {
      const result = await connection.execute(`SELECT SYSDATE FROM DUAL`);
      console.log('Conexão com banco OK:', result.rows);

      console.log('Receita recebida');
      console.log(JSON.stringify(body, null, 2));

      // Aqui depois você coloca INSERT no banco
    } catch (error) {
      console.error('Erro ao processar receita:', error);
      throw error;
    } finally {
      await connection.close();
    }

    return {
      status: 'receita recebida',
    };
  }
  // Endpoint para cancelar receita
  @Post('cancelar-receita')
  @HttpCode(201)
  cancelarReceita(
    @Headers('authorization') auth: string,
    @Body() body: { idPrescricao: number },
  ) {
    this.validarAutorizacao(auth);

    console.log('Cancelamento de receita recebido');
    console.log(`ID da prescrição: ${body.idPrescricao}`);

    // Aqui você pode adicionar lógica para cancelar a receita no sistema

    return { status: 'receita cancelada', idPrescricao: body.idPrescricao };
  }
}
