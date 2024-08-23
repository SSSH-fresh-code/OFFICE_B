import {MainPageDto} from '../presentation/dto/MainPageDto';
import {UserInSession} from '../../user/infrastructure/auth';

export interface iBlogService {
  getMain(user: UserInSession): Promise<MainPageDto>;
}
