export enum ExceptionEnum {
  ALREADY_EXISTS = '이미 존재하는 {param} 입니다.',
  PARAMETER_NOT_FOUND = '{param}이(가) 존재하지 않습니다.',
  INVALID_PARAMETER = '{param}이(가) 올바르지 않습니다.',
  INTERNAL_SERVER_ERROR = '에러가 발생하였습니다.\n관리자에게 문의해주세요.',
  ACCOUNT_WITHOUT_PERMISSION = '로그인 권한이 없는 계정입니다.',
  FORBIDDEN = '권한이 없습니다.',
  NOT_LOGGED_IN = '로그인한 상태가 아닙니다.',
  MESSAGE_SENDING_ERROR = '{param} 메세지가 전송 중 오류가 발생했습니다.'
}