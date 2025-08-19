import { HttpException, HttpStatus } from '@nestjs/common';
import { logError } from './common';

export class ApiResponse {
  private status_code: number;
  private code?: string;
  private message: string;
  private toast_header?: string;
  private toast_body?: string;
  private toast?: boolean;
  private toast_type?: string;
  private return_json?: boolean = false;
  private clear_routes: boolean = false;
  private data?: Record<string, any> = {};
  private errors?: any = [];
  private wait?: boolean = false;
  private redirect?: string | boolean;
  private logout: boolean = false;
  private refresh: boolean = false;

  constructor(options ?: BaseResponseOption) {
    if (options) {
      this.message = options.message ?? '';
      this.toast_header = options.toast_header ?? undefined;
      this.toast_body = options.toast_body ?? undefined;
      this.toast_type = options.toast_type ?? undefined;
      this.return_json = options.return_json ?? undefined;
      this.clear_routes = options.clear_routes ?? false;
      this.data = options.data ?? {};
      this.errors = options.errors ?? [];
      this.wait = options.wait ?? false;
      this.redirect = options.redirect;
      this.logout = options.logout ?? false;
      this.refresh = options.refresh ?? false;
      
    }
  }

  validationError(options: { errors: any; status_code ?: number }) {
    this.code = 'VALIDATION_ERROR';
    this.status_code = options.status_code ?? HttpStatus.UNPROCESSABLE_ENTITY;
    this.errors = options.errors;
    
    return this.buildResponse();
  }
  error(options: { errors ?: any; status_code : number ; code : string }) {
    this.code = options.code;
    this.status_code = options.status_code;
    this.errors = options.errors;
    return this.buildResponse();
  }

  serverError(options: { error: any; logout : boolean; redirect : string | boolean; status_code ?: number }) {
    if (options.error instanceof HttpException) {
      return options.error;
    }
    this.code = 'SERVER_ERROR';
    this.status_code = options.status_code ?? HttpStatus.INTERNAL_SERVER_ERROR;
    this.logout = options.logout;
    this.redirect = options.redirect;
    logError(options.error);

    return this.buildResponse();
  }

  successResponse(options: { code: string; data ?: Record<string, any>; status_code : number }) {
    this.code = options.code;
    this.status_code = options.status_code;
    this.data = options.data ?? {};
    return this.buildResponse();
  }
  
  private toObject(): BaseResponseOption {
    const response: any = {
      status_code: this.status_code,
      code: this.code,
    };
    if (this.message) response.message = this.message;
    if (this.toast_body) response.toast_body = this.toast_body;
    if (this.toast_header) response.toast_header = this.toast_header;
    if (this.toast) response.toast = this.toast;
    if (this.toast_type) response.toast_type = this.toast_type;
    if (this.redirect !== undefined) response.redirect = this.redirect;
    if (this.refresh) response.refresh = this.refresh;
    if (this.wait) response.wait = this.wait;
    if (this.errors) response.errors = this.errors;
    if (this.data && Object.keys(this.data).length > 0) response.data = this.data;
    if (this.logout) response.logout = this.logout;
    if (this.clear_routes) response.clear_routes = this.clear_routes;
    return response;
  }

  private checkToast() {
    if (this.toast_body || this.toast_header || this.toast_type) {
      if (!this.toast_body || !this.toast_header || !this.toast_type) {
        throw new Error(
          'All toast properties (toast_body, toast_header, toast_type) must be provided',
        );
      }
      this.toast = true;
    } else {
      this.toast = false;
    }
  }

  private buildResponse(): BaseResponseOption {
    this.checkToast();
    if (this.return_json || this.status_code < 400) {
      return this.toObject();
    }
    throw new HttpException(this.toObject(), this.status_code);
  }

  static serviceResponse(options: { status_code: number; data?: Record<string, any>; errors?: any; error?: any } & Record<string, any>) {
    if (options.status_code >= 500 && !options.error) {
      throw new Error("ERROR SHOULD BE SPECIFIED");
    }
    if (options.status_code === HttpStatus.UNPROCESSABLE_ENTITY && (!options.errors || Object.keys(options.errors).length === 0)) {
      throw new Error("ERRORS SHOULD BE SPECIFIED");
    }

    // options already contains any extra properties via the intersection type
    return options;
  }
}
