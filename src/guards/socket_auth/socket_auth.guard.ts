import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';
import { SocketState } from '@src/services/socket.state';
import { AuthService } from '@src/ws/api/auth/auth.service';
import { Auth } from '@src/ws/api/auth/entities/auth.entity';
import { Socket } from 'socket.io';

interface SocketGuardOptions {
  updates?: string[];
  usersList?: Record<string, any>;
  forceUpdate? : boolean
}

export function SocketAuthGuard({ forceUpdate = true , usersList = {} } : SocketGuardOptions = {} ): Type<CanActivate> {
  
  @Injectable()
  class RolePermissionSocketAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService,
      private readonly socketState: SocketState
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      let token : string | undefined;
      let request;
      
      request = context.switchToWs().getClient<Socket>();
      
      token = request.handshake.headers.authorization || request.handshake?.auth?.token;
      if (token?.startsWith('Bearer') || token?.includes(' ')) {
        token = token.split(' ')[1]
      }
      
      if (process.env['MODE'] && !token) {
        token = request.handshake.query.token
      }
      
      if (token?.startsWith('Bearer') || token?.includes(' ')) {
        token = token.split(' ')[1]
      }
      
      
      if (token) {
        
        usersList = this.socketState.usersList;
        
        let user = await this.authService.decodeToken(token , true);
        
        
        if (!user) {
          request.disconnect();
          return true;
        }
        if (forceUpdate) {
          let auth : Auth = await this.authService.decodeToken(token , false);
          
          if (auth) {
            usersList[auth.id] = auth;
            request.user = auth;
            return true;
          }
        }
        
        return true;
      }
      console.log('disconnected');
      
      request.disconnect();

      return false
    }
  }
  
  return mixin(RolePermissionSocketAuthGuard);
}
