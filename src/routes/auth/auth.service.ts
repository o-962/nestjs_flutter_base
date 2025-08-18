import { HttpStatus, Injectable, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword, verifyPassword } from '@utils/password';
import { SuccessResponse, validationErrorResponse } from '@utils/response';
import { FastifyRequest } from 'fastify';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepo : Repository<Auth>,
    private readonly jwt : JwtService
  ) {}
  async create(createAuthDto: CreateAuthDto) {
    createAuthDto.password = await hashPassword(createAuthDto.password);
    
    const auth = this.authRepo.create(createAuthDto);
    await this.authRepo.save(auth);
    
    let token = this.jwt.sign({
      id : auth.id,
      user_name : auth.user_name,
      role : "student",
      permission : ['view_courses']
    })
    return SuccessResponse({
      data : {token},
      code : "REGISTERED",
      toast_header : "registered_success",
      toast_body : "registered_success",
      toast_type : "default",
      returnJson : true,
      refresh : true,
      status_code : HttpStatus.OK
    })
  }

  async login(loginAuthDto: LoginAuthDto) {
    const record = await this.authRepo.findOneBy({email : loginAuthDto.email});
    
    
    if (record) {
      let verified = await verifyPassword( loginAuthDto.password , record?.password)
      if (verified) {
        let token = this.jwt.sign({ 
          id : record.id,
          user_name : record.user_name,
          role : "student",
          permission : ['view_courses']
        })
        
        return SuccessResponse({
          data : {token},
          code : "LOGGED_IN",
          returnJson : true,
          toast_header : "success",
          toast_body : "logged_successfully",
          toast_type : "success",
          redirect : "/upload",
          status_code : HttpStatus.OK
        })
      }
    }

    return validationErrorResponse({ returnJson : true , errors : { "email" : [  ], "password" : [  ], } , code : "INVALID" , toast_header : "email or password aren't correct" , toast_body : "error" })
  }
  me(@Req() req: FastifyRequest) {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = this.jwt.verify(token);
      if (decoded) return decoded;
    }
    return null
  }
}
