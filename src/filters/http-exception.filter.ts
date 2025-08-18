// filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ServerErrorResponse } from '@src/utils/response';
import { FastifyReply } from 'fastify';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();

    const status =
      exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();
    const error = (exceptionResponse as any)?.error || HttpStatus[status];
    const message = (exceptionResponse as any)?.message || exception.message;

    response.status(status).send(ServerErrorResponse({error : error}));
  }
}
