import { Test, TestingModule } from '@nestjs/testing';
import { TranslationsService } from './translations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Translation } from './entities/translation.entity';

describe('TranslationsService', () => {
  let service: TranslationsService;

  // Create a mock repository object
  const mockTranslationRepository = {
    find: jest.fn(),
    // add other methods you might use, e.g. findOne, save, etc.
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationsService,
        {
          provide: getRepositoryToken(Translation), // Tell Nest how to inject repository
          useValue: mockTranslationRepository,       // Use this mock instead of real repo
        },
      ],
    }).compile();

    service = module.get<TranslationsService>(TranslationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
