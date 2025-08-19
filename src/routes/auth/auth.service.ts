import { HttpStatus, Injectable, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { sharedData } from '@src/common/data';
import { NotificationsService } from '@src/notifications/notifications.service';
import { canSendOtp } from '@src/utils/common';
import { hashPassword, verifyPassword } from '@utils/password';
import { FastifyRequest } from 'fastify';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ForgetPassword } from './dto/forget-password-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Auth } from './entities/auth.entity';
import { ApiResponse } from '@src/utils/response';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
    private readonly jwt: JwtService,
    private readonly notification: NotificationsService,
  ) {}
  async create(createAuthDto: CreateAuthDto) {
    createAuthDto.password = await hashPassword(createAuthDto.password);

    const auth = this.authRepo.create(createAuthDto);
    await this.authRepo.save(auth);

    let token = this.jwt.sign({
      id: auth.id,
      user_name: auth.user_name,
      role: 'student',
      permission: ['view_courses'],
    });
    return new ApiResponse({
      data: { token },
      toast_header: 'registered_success',
      toast_body: 'registered_success',
      toast_type: 'default',
      return_json: true,
      refresh: true,
    }).successResponse({
      code: 'REGISTERED',
      status_code: HttpStatus.CREATED,
      data: { token },
    });
  }

  async login(loginAuthDto: LoginAuthDto) {
    const record = await this.authRepo.findOneBy({ email: loginAuthDto.email });
    try {
      if (record) {
        let verified = await verifyPassword( loginAuthDto.password, record?.password, );
        if (verified) {
          let token = this.jwt.sign({
            id: record.id,
            user_name: record.user_name,
            role: 'student',
            permission: ['view_courses'],
          });
          return ApiResponse.serviceResponse({
            status_code: HttpStatus.OK,
            data: { token },
          });
        }
      }
    } catch (error) {
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error,
      });
    }
    return ApiResponse.serviceResponse({
      status_code: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: { email: [], password: [] },
    });
  }

  async forgetPassword(forgetPassword: ForgetPassword) {
    const phoneNumber = forgetPassword.phone_number;
    const email = forgetPassword.email;
    const userName = forgetPassword.user_name;

    const user = await this.authRepo.findOne({
      where: [
        { email: email },
        { phone_number: phoneNumber },
        { user_name: userName },
      ],
    });

    if (user) {
      const sentAt = user.otp_sent_at;
      const timeGood = canSendOtp(`${sentAt}`);
      const withinLimit = user.time_sent <= sharedData.otp.otp_times;
      const hasContact = phoneNumber || email || userName;

      if (timeGood && withinLimit && hasContact) {
        if (email) {
          const otp = await this.notification.sendEmailOtp(email);
          user.otp = otp;
          this.authRepo.save(user);
        }
      }
    }
    return new ApiResponse().successResponse({
      code: 'good',
      status_code: HttpStatus.OK,
    });
  }

  me(@Req() req: FastifyRequest) {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = this.jwt.verify(token);
      if (decoded) return decoded;
    }
    return null;
  }
}
