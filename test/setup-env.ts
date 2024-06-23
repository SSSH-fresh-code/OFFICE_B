import { execSync } from 'child_process';
import { config } from 'dotenv';

process.env.LOG_LEVEL = 'debug';

// .env.test 파일을 로드합니다.
config({ path: '.env.test' });

execSync("rm ./prisma/dev.db");
execSync("npx prisma db push --schema=./prisma/schema.test.prisma");
