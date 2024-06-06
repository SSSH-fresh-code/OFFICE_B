import { execSync } from 'child_process';
import { config } from 'dotenv';

// .env.test 파일을 로드합니다.
config({ path: '.env.test' });

execSync("npx prisma db push --schema=./prisma/schema.test.prisma");