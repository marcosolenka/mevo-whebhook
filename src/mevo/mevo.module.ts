import { Module } from '@nestjs/common';
import { MevoController } from './mevo.controller';

@Module({
  controllers: [MevoController],
})
export class MevoModule {}
