import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // await prisma.permission.create({
  //   data: {
  //     name: "LOGIN001",
  //     description: "백오피스 로그인 권한"
  //   }
  // });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });