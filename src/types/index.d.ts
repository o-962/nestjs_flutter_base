export {};

declare global {
  type BaseResponse = {
    code: string;
    status_code: number;
    message?: string | null;
    toast_body?: string | null;
    toast_header?: string | null;
    toast?: boolean;
    toast_type?: string;
    redirect?: string;
    refresh?: boolean;
    wait?: boolean;
    errors?: any;
    data?: any;
    logout?:boolean,
    page? : string | null,
    clearRoutes? : bool,
  };

  type ResponseOptions = BaseResponse & {
    returnJson?: boolean;
  };

  type ServerErrorResponseOptions = ResponseOptions & {
    error?: any;
  };

  type AuthUser = {
    auth_id: string | number;
    user_id: number;
    user_name: string;
    role: string;
    permissions: string[];
    iat?: number;
    exp?: number;
  };
}