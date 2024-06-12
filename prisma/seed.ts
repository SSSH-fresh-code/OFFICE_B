import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.permission.upsert({
    where: { name: "LOGIN001" },
    create: {
      name: "LOGIN001",
      description: "로그인 권한"
    },
    update: {
      description: "로그인 권한"
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });