export {};

declare global {
  type BaseResponseOption = {
    code?: string;
    status_code?: number;
    message?: string | null;
    toast_body?: string | null;
    toast_header?: string | null;
    toast?: boolean;
    toast_type?: string;
    redirect?: string;
    refresh?: boolean;
    wait?: boolean;
    errors?: any;
    error ?: any;
    data?: any;
    logout?:boolean,
    page? : string | null,
    clear_routes? : boolean,
    return_json? : boolean,
  };

  type ValidationErrorOption = BaseResponse & {
    status_code ?: number
  }
  type ErrorOption = BaseResponse & {
    error : any
  }

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