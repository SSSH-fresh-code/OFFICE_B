export type UserInSession = { id: string; permissions: string[] };

// src/types/express.d.ts
import { ReadUserDto } from "src/user/presentation/dto/read-user.dto"; // 실제 ReadUserDto 경로에 맞게 수정

declare global {
	namespace Express {
		interface Request {
			user?: ReadUserDto | null;
		}
	}
}
