import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, ValidationPipe, } from '@nestjs/common';
// import { anyResponse, ErrorResponse, ServerErrorResponse, SuccessResponse, validationErrorResponse, } from '@src/utils/response';
import type { FastifyReply, FastifyRequest } from 'fastify';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgetPassword } from './dto/forget-password-auth.dto';
import { Response } from 'express';
import { ApiResponse } from '@src/utils/response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) createAuthDto: CreateAuthDto , @Res({passthrough : true}) res : FastifyReply) {
    try {
      const result = await this.authService.create(createAuthDto);
      const response = new ApiResponse({
        return_json: true,
        toast_header: 'GOOD',
        toast_body: 'REGISTERED in succesfully',
        toast_type: 'GOOD',
      }).successResponse({
        code: 'LOGGED_IN',
        status_code: HttpStatus.CREATED,
        data : result.data,
      });
      return res.status(HttpStatus.CREATED).send(response);
    } catch (error) {
      return new ApiResponse().serverError({
        error,
        logout : false,
        redirect : false
      })
    }
  }
  @Post('login')
  async login( @Body(ValidationPipe) loginAuthDto: LoginAuthDto, @Res({ passthrough: true }) res: FastifyReply, ) {
    try {
      const result = await this.authService.login(loginAuthDto);
      let response
      if (result.status_code == HttpStatus.OK) {
        response = new ApiResponse({
          return_json: true,
          toast_header: 'GOOD',
          toast_body: 'Logged in succesfully',
          toast_type: 'GOOD',
        }).successResponse({
          code: 'LOGGED_IN',
          status_code: HttpStatus.OK,
          data : result.data,
        });
        return res.status(HttpStatus.OK).send(response);
      }
      
      response = new ApiResponse().validationError({ errors : { email : [], password : [] } });

      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send(response);
    } catch (error) {
      return new ApiResponse().serverError({
        error : error,
        redirect : false,
        logout : true,
      })
    }
  }
  @Post('forget-password')
  async forgetPassword( @Body(ValidationPipe) forgetPassword: ForgetPassword ) {
    try {
      const response = await this.authService.forgetPassword(forgetPassword);

      return new ApiResponse().successResponse({
        code : "SUCCESS",
        data : {},
        status_code : HttpStatus.OK
      });
    } catch (error) {
      return new ApiResponse().serverError({
        error,
        logout : false,
        redirect : '/welcome',
        status_code : HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  }
}
