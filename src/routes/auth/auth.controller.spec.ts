import { HttpStatus } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createTestModule } from '@src/tests/utils/db';
import { mockRequest } from '@test/common/mockRequest';
import type { FastifyReply } from 'fastify';
import { Repository } from 'typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';
import { validateDtoManually } from '@src/tests/utils/dto';
import { IsExistsValidator } from '@src/validators/is_exists/is-exists.validator';

const mockedOriginal = mockRequest.auth;

describe('AuthController', () => {
  let controller: AuthController;
  let module: TestingModule;
  let authRepo: Repository<Auth>;
  const mockRes = {
    setCookie: jest.fn(),
  };

  beforeAll(async () => {
    try {
      module = await createTestModule([AuthController], [AuthService]);
      controller = module.get<AuthController>(AuthController);
      authRepo = module.get<Repository<Auth>>(getRepositoryToken(Auth));
    } catch (error) {
      console.error('Failed to create test module:', error);
      throw error;
    }
  });

  beforeEach(() => {
    mockRequest.auth = JSON.parse(JSON.stringify(mockedOriginal));
  });
  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create auth', () => {
    it('should return an account and set session cookie', async () => {
      const mockSetCookie = jest.fn();

      const auth = await controller.register(
        mockRequest.auth,
        { setCookie: mockSetCookie } as unknown as FastifyReply,
      );

      expect(auth).toMatchObject({
        status_code: 200,
        code: 'LOGGED_IN',
      });

      expect(mockSetCookie).toHaveBeenCalledWith(
        'session',
        expect.any(String), // signed session token
        {
          httpOnly: process.env.MODE !== 'DEV',
          secure: process.env.MODE !== 'DEV',
          sameSite: 'lax',
          path: '/',
          maxAge: 86400,
          signed: true,
        }
      );
    });

    it('should return an account duplication', async () => {
      try {
        await validateDtoManually(CreateAuthDto, mockRequest.auth, module);
        fail();
      } catch (error) {
        const res = error.getResponse();
        expect(error.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(res).toMatchObject({
          code: 'VALIDATION_ERROR',
          status_code: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      }
    });
  });
  describe('login', () => {
    it('should return logged in and set session cookie', async () => {
      mockRequest.auth.password = 'gh90ghgh';
      const mockSetCookie = jest.fn();

      const auth = await controller.login(
        mockRequest.auth,
        { setCookie: mockSetCookie } as unknown as FastifyReply,
      );

      expect(auth).toMatchObject({
        status_code: HttpStatus.OK,
        code: 'LOGGED_IN',
      });

      expect(mockSetCookie).toHaveBeenCalledWith(
        'session',
        expect.any(String),
        {
          httpOnly: process.env.MODE !== 'DEV',
          secure: process.env.MODE !== 'DEV',
          sameSite: 'lax',
          path: '/',
          maxAge: 86400,
          signed: true,
        }
      );
    });
    it('should return logged in error bad password', async () => {
      mockRequest.auth.password = '123132123';
      try {
        await controller.login(
          mockRequest.auth,
          mockRes as unknown as FastifyReply,
        );
      } catch (error) {
        const res = error.getResponse();
        expect(res).toMatchObject({
          code: 'INVALID',
          status_code: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: [],
            password: [],
          },
        });
      }
    });
    it('should return logged in error bad email', async () => {
      mockRequest.auth.email = 'xxxxxx';
      mockRequest.auth.password = 'gh90ghgh';
      try {
        await controller.login(
          mockRequest.auth,
          mockRes as unknown as FastifyReply,
        );
      } catch (error) {
        const res = error.getResponse();
        expect(res).toMatchObject({
          code: 'INVALID',
          status_code: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: [],
            password: [],
          },
        });
      }
    });
  });
  describe('logout', () => {
    it('should clear session cookie and return success response', async () => {
      const mockRes = {
        clearCookie: jest.fn(),
      };

      const result = await controller.logout(mockRes as any);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('session', {
        path: '/',
        httpOnly: process.env.MODE !== 'DEV',
        secure: process.env.MODE !== 'DEV',
        sameSite: 'lax',
      });

      expect(result).toMatchObject({
        code: 'LOGGED_OUT',
        refresh: true,
        toast_header: 'Success',
        toast_body: 'Logged out successfully',
        toast_type: 'default',
        status_code: 200,
      });
    });
  });
});
