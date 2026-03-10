import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as oracledb from 'oracledb';
import { ConfigService } from '@nestjs/config';

// Inicializa Oracle Instant Client (Thick Mode)
try {
  oracledb.initOracleClient({
    libDir: 'C:\\instantclient\\instantclient_23_0',
  });
  console.log('Oracle Instant Client carregado');
} catch (err: any) {
  console.warn('Oracle Client já inicializado ou não necessário:', err.message);
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: oracledb.Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.pool = await oracledb.createPool({
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASS'),
      connectString: this.configService.get<string>('DB_CONNECT'),

      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1,
      poolPingInterval: 60,
    });

    console.log('Pool Oracle criado');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.close(0);
      console.log('Pool Oracle fechado');
    }
  }

  async getConnection(): Promise<oracledb.Connection> {
    return this.pool.getConnection();
  }
}
