import { prisma } from '../lib/prisma';

async function main() {
  await prisma.allowedEmail.upsert({
    where: { email: "spahic.sabahudin1@gmail.com" },
    update: { isSuperAdmin: true },
    create: {
      email: "spahic.sabahudin1@gmail.com",
      isSuperAdmin: true
    }
  });

  console.log("✅ Super admin seeded.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
