import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { User } from '../../domain/user.entity';

@ApiTags('auth')
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  @ApiOperation({ summary: '로컬 전략으로 유저 인증' })
  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(email, password);

    return user;
  }
}