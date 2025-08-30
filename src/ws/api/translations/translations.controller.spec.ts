import { Test, TestingModule } from '@nestjs/testing';
import { TranslationsService } from './translations.service';
import { TranslationsController } from './translations.controller';

describe('TranslationsController', () => {
  let controller: TranslationsController;
  let service: TranslationsService;

  const mockTranslationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TranslationsController],
      providers: [
        {
          provide: TranslationsService,
          useValue: mockTranslationsService,
        },
      ],
    }).compile();

    controller = module.get<TranslationsController>(TranslationsController);
    service = module.get<TranslationsService>(TranslationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
