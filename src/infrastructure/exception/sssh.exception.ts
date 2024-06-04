import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionEnum } from './exception.enum';
import { formatMessage } from '../util/message.util';

export class SsshException extends HttpException {
  constructor(exceptionEnum: ExceptionEnum, statusCode: HttpStatus, params: { [key: string]: any } = {}) {
    super(formatMessage(exceptionEnum, params), statusCode);
  }
}