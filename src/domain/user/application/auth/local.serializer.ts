import {Injectable} from '@nestjs/common';
import {PassportSerializer} from '@nestjs/passport';
import {User} from '../../domain/user.entity';

@Injectable()
export class LocalSerializer extends PassportSerializer {
  constructor() {
    super();
  }

  serializeUser(user: User, done: CallableFunction) {
    const {id, permissions} = user;
    done(null, `${id}:${permissions.join(',')}`);
  }

  async deserializeUser(info: string, done: (err: any, user?: any) => void) {
    try {
      const [id, permissionsString] = info.split(':');
      const permissions = permissionsString.split(',');

      done(null, {id, permissions});
    } catch (err) {
      done(err);
    }
  }
}
