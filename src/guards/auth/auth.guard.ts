import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';
import { ApiResponse } from '@src/models/api.model';
import { AuthService } from '@src/ws/api/auth/auth.service';
import { Socket } from 'socket.io';

export function AuthGuard({ role = [], permission = [] , bypass = false , bypassSql = false } = {}): Type<CanActivate> {
  @Injectable()
  class RolePermissionAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      let token : string | undefined;
      let request;
      if (context.getType() == "http") {
        request = context.switchToHttp().getRequest();
        token = request.headers['authorization'] || request.headers['Authorization'];
        if (process.env['MODE'] && !token) {
          token = request.query.token
        }
      }
      else if (context.getType() == "ws") {
        request = context.switchToWs().getClient<Socket>();
        token = request.handshake.headers.authorization;
        if (process.env['MODE'] && !token) {
          token = request.handshake.query.token
        }
      }
      
      
      if (bypassSql) {
        request.user = bypassSql;
        return true;
      }
      
      if (!token && !bypass) {
        return false;
      }

      if (token && token.startsWith('Bearer ')) {
        token = token.split(" ")[1]
      }
      let user;
      if (token) {
        user = await this.authService.decodeToken(token , false);
      }
      
      if (bypass) {
        if (user) {
          request.user = user;
        }
        return true;
      }

      if (!user) {
        return new ApiResponse().unAuthorized();
      }

      if (role) {
        const allowedRoles = Array.isArray(role) ? role : [role];
      }
      
      if (role) {
        const allowedPermissions = Array.isArray(permission) ? permission : [permission];
      }
      
      request.user = user;
      
      return true;
    }
  }
  
  return mixin(RolePermissionAuthGuard);
}
