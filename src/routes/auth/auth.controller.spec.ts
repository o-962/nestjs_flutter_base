import { HttpException, HttpStatus } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { FastifyReply } from 'fastify';
import { Repository } from 'typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';

function createMockReply(): FastifyReply {
  const mock: Partial<FastifyReply> = {
    status: jest.fn().mockImplementation(function (code: number) {
      return this; // allow chaining
    }),
    send: jest.fn().mockImplementation(function (body: any) {
      return body; // return what is sent
    }),
  };
  return mock as FastifyReply;
}

describe('AuthController', () => {
  let controller: AuthController;
  let module: TestingModule;
  let authRepo: Repository<Auth>;
  const mockRes = {
    setCookie: jest.fn(),
  };

  beforeAll(async () => {
    
  });

  
  
  
});
