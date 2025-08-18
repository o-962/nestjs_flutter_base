import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException, mixin, Type, HttpStatus, } from '@nestjs/common';
import { AuthService } from '@routes/auth/auth.service';
import { ErrorResponse } from '@utils/response';

export function AuthGuard( role?: string | string[], permission?: string | string[], ): Type<CanActivate> {
  @Injectable()
  class RolePermissionAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();

      const user = await this.authService.me(request);

      if (!user) {
        throw ErrorResponse({
          code : "UNAUTHORIZED",
          toast_header : "error",
          toast_body : "you_are_unauthorized",
          status_code : HttpStatus.UNAUTHORIZED
        });
      }

      if (role) {
        const allowedRoles = Array.isArray(role) ? role : [role];
        if (!allowedRoles.includes(user.role)) {
          throw ErrorResponse({
            code : "UNAUTHORIZED",
            toast_header : "error",
            toast_body : "you_are_unauthorized",
            status_code : HttpStatus.UNAUTHORIZED
          });
        }
      }

      if (role) {
        const allowedPermissions = Array.isArray(permission) ? permission : [permission];
        const userPermissions = user.permissions || [];
        const hasPermission = allowedPermissions.some((perm) =>
          userPermissions.includes(perm),
        );

        if (!hasPermission) {
          throw ErrorResponse({
            code : "UNAUTHORIZED",
            toast_header : "error",
            toast_body : "you_are_unauthorized",
            status_code : HttpStatus.UNAUTHORIZED
          });
        }
      }

      request.user = user;
      return true;
    }
  }
  
  return mixin(RolePermissionAuthGuard);
}
