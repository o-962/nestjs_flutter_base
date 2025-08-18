import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@src/routes/auth/auth.service';
import { LangsService } from '@src/routes/langs/langs.service';
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
    
    expect(result).toEqual(
      expect.objectContaining({
        translations: expect.any(Array),
        user: expect.anything(),  // can be null or object
        fields: expect.any(Object),
      })
    );
  });
});
