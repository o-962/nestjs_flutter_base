import { HttpException, HttpStatus } from "@nestjs/common";


const validationErrorResponse = ({
  status_code = HttpStatus.UNPROCESSABLE_ENTITY,
  code = 'VALIDATION_ERROR',
  message = null,
  errors,
  toast_header = null,
  toast_body = null,
  returnJson,
  page,
  clearRoutes = false,
  data,
}: Partial<ServerErrorResponseOptions>) => {
  let toast = false;
  if (toast_body || toast_header) {
    if (!toast_body) {
      throw new Error("Body")
    }
    if (!toast_header) {
      throw new Error("heatoast_header")
    }
    if (toast_body && toast_header) {
      toast = true;
    }
  }
  const response = {
    code,
    status_code,
    message,
    toast_body,
    toast_header,
    page,
    data,
    clearRoutes,
    errors,
    toast
  };
  
  if (returnJson) {
    return response;
  } else {
    throw new HttpException(response, status_code);
  }
};


const SuccessResponse = ({
  status_code = HttpStatus.OK,
  code = "success",
  message,
  data,
  toast_body,
  toast_header,
  toast_type,
  refresh,
  wait = false,
  clearRoutes,
  redirect,
  page = null,
}: ResponseOptions) => {
  let toast = false;

  if (toast_body || toast_header || toast_type) {
    if (!toast_body || !toast_header || !toast_type) {
      throw new Error(
        "All toast properties (toast_body, toast_header, toast_type) must be provided when using toast"
      );
    }
    toast = true;
  }

  if (toast) {
    wait = true;
  }

  return {
    code,
    status_code,
    message,
    toast_body,
    toast_header,
    toast,
    toast_type,
    refresh,
    redirect,
    wait,
    clearRoutes,
    page,
    data,
  };
};


const ErrorResponse = ({
  status_code = HttpStatus.NOT_FOUND,
  code,
  message = null,
  errors,
  toast_header = null,
  toast_body = null,
  returnJson = true,
  data = {},
  logout = false,
  clearRoutes,
  page
}: ResponseOptions) => {
  if (!code) {
    throw new Error("You must specify the 'code' property");
  }

  if (!message && !toast_header && !toast_body) {
    throw new Error("You should specify at least one of message, toast_header, or toast_body");
  }

  const response: BaseResponse = {
    code,
    status_code,
    message,
    toast_body,
    toast_header,
    errors,
    data,
    logout,
    page,
    clearRoutes,
  };

  if (returnJson) {
    return response;
  }
  
  throw new HttpException(response, status_code);
};



const ServerErrorResponse = ({
  status_code = HttpStatus.INTERNAL_SERVER_ERROR,
  code = "SERVER_ERROR",
  errors = null,
  toast_header = "An unexpected error occurred",
  toast_body = "Something went wrong. Please try again later.",
  returnJson = true,
  data = {},
  clearRoutes,
  error,
  page = null,
}: Partial<ServerErrorResponseOptions> = {}) => {
  const response: BaseResponse = {
    code,
    status_code,
    toast_body,
    toast_header,
    data,
    clearRoutes,
    errors,
    page
  };
  
  if (returnJson) {
    return response;
  }
  
  throw new HttpException(response, status_code);
};


const anyResponse = (result: any) => {
  
  if (result.status_code >= 200 && result.status_code <= 299) {
    return result;
  }
  else{
    return new HttpException(result, result.status_code);
  }
};




export { anyResponse, ErrorResponse, ServerErrorResponse, SuccessResponse, validationErrorResponse };

