import { Test, TestingModule } from '@nestjs/testing';
import { InitsController } from './inits.controller';
import { InitsService } from './inits.service';

describe('InitsController', () => {
  let controller: InitsController;

  const mockInitsService = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InitsController],
      providers: [
        {
          provide: InitsService,
          useValue: mockInitsService,
        },
      ],
    }).compile();

    controller = module.get<InitsController>(InitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
