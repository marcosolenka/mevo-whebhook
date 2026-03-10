import { Test, TestingModule } from '@nestjs/testing';
import { MevoController } from './mevo.controller';

describe('MevoController', () => {
  let controller: MevoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MevoController],
    }).compile();

    controller = module.get<MevoController>(MevoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
