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
import * as oracledb from 'oracledb';
import * as fs from 'fs';
import * as path from 'path';

@Controller('mevo')
export class MevoController {
  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {}

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

  // RECEBER RECEITA
  @Post('receita')
  @HttpCode(201)
  async receberReceita(
    @Headers('authorization') auth: string,
    @Body() body: any,
  ) {
    this.validarAutorizacao(auth);

    const connection = await this.databaseService.getConnection();

    try {
      this.salvarLog(auth, body);
      const payload = JSON.stringify(body);

      const result = await connection.execute(
        `
        BEGIN
          INTG_MEVO.PKG_MEVO_API_TASY.CARGA_JSON(
            P_PAYLOAD => :payload,
            P_RETORNO => :retorno
          );
        END;
        `,
        {
          payload: { val: payload, type: oracledb.CLOB },
          retorno: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
      );

      console.log('Receita processada:', result.outBinds);

      return {
        status: 'receita processada',
        retorno: result.outBinds.retorno,
      };
    } catch (error) {
      console.error('Erro ao processar receita:', error);
      throw error;
    } finally {
      await connection.close();
    }
  }

  // CANCELAR RECEITA
  @Post('cancelar-receita')
  @HttpCode(201)
  async cancelarReceita(
    @Headers('authorization') auth: string,
    @Body() body: any,
  ) {
    this.validarAutorizacao(auth);

    const connection = await this.databaseService.getConnection();

    try {
      this.salvarLog(auth, body);
      const payload = JSON.stringify(body);

      const result = await connection.execute(
        `
        BEGIN
          INTG_MEVO.PKG_MEVO_API_TASY.CANCELA_JSON(
            P_PAYLOAD => :payload,
            P_RETORNO => :retorno
          );
        END;
        `,
        {
          payload: { val: payload, type: oracledb.CLOB },
          retorno: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
      );

      console.log('Cancelamento processado:', result.outBinds);

      return {
        status: 'cancelamento processado',
        retorno: result.outBinds.retorno,
      };
    } catch (error) {
      console.error('Erro ao cancelar receita:', error);
      throw error;
    } finally {
      await connection.close();
    }
  }

  private salvarLog(auth: string, body: any) {
    const data = new Date();
    const date = data.toISOString().split('T')[0];

    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, `webhook-${date}.log`);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const log = {
      timestamp: data.toISOString(),
      authorization: auth,
      body: body,
    };

    fs.appendFileSync(logFile, JSON.stringify(log) + '\n');
  }
}
