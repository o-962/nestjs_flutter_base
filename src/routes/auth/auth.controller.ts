import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import {
  anyResponse,
  ErrorResponse,
  ServerErrorResponse,
  SuccessResponse,
  validationErrorResponse,
} from '@src/utils/response';
import type { FastifyReply, FastifyRequest } from 'fastify';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) createAuthDto: CreateAuthDto) {
    try {
      const result = await this.authService.create(createAuthDto);
      return anyResponse(result);
    } catch (error) {
      ServerErrorResponse({ error });
    }
  }
  @Post('login')
  async login( @Body(ValidationPipe) loginAuthDto: LoginAuthDto, @Res({ passthrough: true }) res: FastifyReply, ) {
    try {
      const result = await this.authService.login(loginAuthDto);
      return anyResponse(result);
    } catch (error) {
      return ServerErrorResponse({error})
    }
  }
}
