import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lang } from './entities/lang.entity'; // Adjust this import path
import { LangsService } from './langs.service';

describe('LangsService', () => {
  let service: LangsService;
  let module;
  
  // Mock repository with the methods you expect to call
  const mockLangRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    // Add other methods if your service uses them
  };
  beforeAll(async ()=>{
    
    
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LangsService,
        {
          provide: getRepositoryToken(Lang),
          useValue: mockLangRepository,
        },
      ],
    }).compile();

    service = module.get<LangsService>(LangsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
