import { execSync } from 'child_process';
import { config } from 'dotenv';
import * as fs from 'fs';

process.env.LOG_LEVEL = 'debug';

// .env.test 파일을 로드합니다.
config({ path: '.env.test' });

if (fs.existsSync('./prisma/dev.db')) {
  execSync('rm ./prisma/dev.db');
}
execSync("npx prisma db push --schema=./prisma/schema.test.prisma");
execSync("prisma generate --schema=prisma/schema.test.prisma && ts-node ./prisma/seed.ts")
