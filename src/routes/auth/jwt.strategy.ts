import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

const cookieExtractor = (req: any): string | null => {
  return req?.cookies?.jwt || null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}