import { TestingModule } from '@nestjs/testing';
import { LangsController } from './langs.controller';


describe('LangsController Integration', () => {
  let controller: LangsController;
  let module: TestingModule;

  beforeAll(async () => {

  });

  afterAll(async () => {
  });

  it('should be defined', () => {
  });
  describe("find" , ()=>{
    let result : any;
    it('should return one language for a valid code', async () => {

    });
    it('should return one language for a not valid code', async () => {
      
    });
  });
});
