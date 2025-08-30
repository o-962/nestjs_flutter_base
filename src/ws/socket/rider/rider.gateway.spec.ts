import { Test, TestingModule } from '@nestjs/testing';
import { RiderGateway } from './rider.gateway';
import { RiderService } from './rider.service';

describe('RiderGateway', () => {
  let gateway: RiderGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiderGateway, RiderService],
    }).compile();

    gateway = module.get<RiderGateway>(RiderGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
