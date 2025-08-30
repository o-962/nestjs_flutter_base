import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { appConfig, sharedData } from '@src/common/data';
import { OrderStatus } from '@src/common/enums';
import { ApiResponse } from '@src/models/api.model';
import { NotificationsService } from '@src/notifications/notifications.service';
import { canSendOtp } from '@src/utils/common';
import { hashPassword, verifyPassword } from '@utils/password';
import { In, Not, Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ForgetPassword } from './dto/forget-password-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    private readonly jwt: JwtService,
    private readonly notification: NotificationsService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    createAuthDto.password = await hashPassword(createAuthDto.password);

    const user = this.userRepo.create({
      gender: createAuthDto.gender,
      bio: createAuthDto.bio,
    });

    await this.userRepo.save(user);

    const auth = this.authRepo.create({
      ...createAuthDto,
      user: user,
    });

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
    const record : Auth | null = await this.authRepo.findOneBy({ email: loginAuthDto.email });
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
            redirect : await this.authRoute(record)
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
    try {
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
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.OK,
        data: {},
      });
    } catch (error) {
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {},
      });
    }
  }


  async decodeToken(token: string , onlyDecode : boolean) {
    let decoded: any;
    try {
      decoded = this.jwt.verify(token);

      if (onlyDecode) {
        return decoded;
      }
    } catch (err) {
      console.log(err);
      
      return undefined;
    }

    if (!decoded?.id) {
      return undefined;
    }

    try {
      const auth = await this.authRepo.findOne({
        where: { id: decoded.id },
        relations : ['user']
      });
      
      return auth || undefined; // return undefined if user not found
    } catch (err) {
      return undefined; // database error
    }
  }

  async authRoute(auth : Auth | null){
    if (auth) {
      const user = auth.user;
      const driver = auth.driver;
      if (driver) {
        return appConfig.routes.driver.map
      }
      if (user) {
        
        const orderExists = await this.orderRepo.findOne({
          where: [
            {
              user: user,
              rated: false,
              order_status: OrderStatus.COMPLETED,
            },
            {
              user: user,
              rated: false,
              order_status: Not(In([OrderStatus.COMPLETED, OrderStatus.CANCELLED])),
            },
            {
              user: user,
              rated: false,
              order_status: OrderStatus.PENDING,
            },
          ],
        });
        console.log(orderExists);
        
        if (orderExists) {
          if (orderExists.order_status == OrderStatus.PENDING) {
            return appConfig.routes.rider.pending;
          }
          else if (orderExists.order_status == OrderStatus.COMPLETED && !orderExists.rated) {
            return appConfig.routes.rider.rate;
          }
          else {
            return appConfig.routes.rider.order_map;
          }
          
        }
        else {
          return appConfig.routes.rider.pickup;
        }
      }
      else {
        return appConfig.routes.rider.order_map;
      }
      
    }
    else {
      return appConfig.routes.rider.welcome;
    }
  }
}
