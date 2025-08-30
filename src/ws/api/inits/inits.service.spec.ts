import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@src/ws/api/auth/auth.service';
import { LangsService } from '@src/ws/api/langs/langs.service';
import { InitsService } from './inits.service';

describe('InitsService', () => {
  let service: InitsService;

  const mockLangsService = {
    findAll: jest.fn().mockResolvedValue([]),  // mock findAll method
  };

  const mockAuthService = {
    me: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),  // mock me method
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InitsService,
        { provide: LangsService, useValue: mockLangsService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<InitsService>(InitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return translations and user', async () => {
    const req = {};
    const result = await service.find(req as any);
    console.log(result);
    
    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('translations')
    expect(result).toHaveProperty('fields')
  });
});
