import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { formatMessage } from '../../../infrastructure/util/message.util';
import { ExceptionEnum } from './exception.enum';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '내부 서버 오류가 발생했습니다.';

    // 예외 코드에 따라 HTTP 상태 코드와 메시지를 설정합니다.
    switch (exception.code) {
      case 'P2025':
        status = HttpStatus.BAD_REQUEST;
        message = '리소스를 찾을 수 없습니다.';
        break;
      case 'P2002':
        status = HttpStatus.BAD_REQUEST;
        message = formatMessage(ExceptionEnum.ALREADY_EXISTS, {param: exception.meta.target})
        break;
    }

    console.log(exception)
    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
