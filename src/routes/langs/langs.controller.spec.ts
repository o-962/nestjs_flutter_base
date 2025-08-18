import { HttpException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { createTestModule } from '@test/utils/db';
import { LangsController } from './langs.controller';
import { LangsService } from './langs.service';

describe('LangsController Integration', () => {
  let controller: LangsController;
  let module: TestingModule;

  beforeAll(async () => {
    module = await createTestModule(
      [LangsController],
      [LangsService],
    );
    controller = module.get<LangsController>(LangsController);

  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe("find" , ()=>{
    let result : any;
    it('should return one language for a valid code', async () => {
      result = await controller.findOne('ar');
      console.log(result);
      
      expect(result).toEqual(
  expect.objectContaining({ lang: 'ar' })
);
    });
    it('should return one language for a not valid code', async () => {
      try {
        result = await controller.findOne('pr');
        fail('Expected exception not thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(404);
        expect(error.message).toBe('Language not found');
      }
    });
  });
});
