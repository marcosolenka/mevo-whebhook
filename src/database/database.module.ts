import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global() // global para ser usado em outros módulos sem importar toda hora
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
