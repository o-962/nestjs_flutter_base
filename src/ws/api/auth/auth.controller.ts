import { Body, Controller, HttpStatus, Post, Res, ValidationPipe } from '@nestjs/common';
// import { anyResponse, ErrorResponse, ServerErrorResponse, SuccessResponse, validationErrorResponse, } from '@src/utils/response';
import { appConfig } from '@src/common/data';
import { ApiResponse } from '@src/models/api.model';
import type { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ForgetPassword } from './dto/forget-password-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

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
        toast_body: 'REGISTERED in successfully',
        toast_type: 'GOOD',
        redirect : appConfig.routes.rider.pickup,
        clear_routes : true
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
      
      if (result.status_code == HttpStatus.OK) {
        return new ApiResponse({
          toast_header: 'GOOD',
          toast_body: 'Logged in succesfully',
          toast_type: 'GOOD',
          redirect : result['redirect'],
          clear_routes : true,
        }).successResponse({
          code: 'LOGGED_IN',
          status_code: HttpStatus.OK,
          data : result.data,
        });
      }
      return new ApiResponse().validationError({ errors : { email : [], password : [] } });
    } catch (error) {
      console.log(error);
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
      if (response.status_code == HttpStatus.OK) {
        return new ApiResponse({
          toast_header : 'GOOD',
          toast_body : 'OTP sent successfully',
          toast_type : 'GOOD',
        }).successResponse({
          code : "SUCCESS",
          data : {},
          status_code : HttpStatus.OK,
        });
      }
    } catch (error) {
      return new ApiResponse({
        toast_header : 'ERROR success good',
        toast_body : 'An error occurred while processing your request',
        toast_type : 'error',
      }).serverError({
        error,
        logout : false,
        redirect : false,
      })
    }
  }
}
