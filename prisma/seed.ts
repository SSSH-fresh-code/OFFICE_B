import { PrismaClient } from '@prisma/client';
import { PermissionDescriptionEnum, PermissionEnum } from '../src/domain/permission/domain/permission.enum';

const prisma = new PrismaClient();

async function main() {
  const keys = Object.keys(PermissionEnum);

  for (const key of keys) {
    const name = PermissionEnum[key];
    const description = PermissionDescriptionEnum[key];

    await prisma.permission.upsert({
      where: { name },
      create: { name, description },
      update: { description }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });