export type BaseResponseOption = {
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
  error?: any;
  data?: any;
  logout?: boolean;
  page?: string | null;
  clear_routes?: boolean;
  return_json?: boolean;
};
