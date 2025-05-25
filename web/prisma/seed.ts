import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed organizations
  const org1 = await prisma.organization.upsert({
    where: { slug: 'org-a' },
    update: {},
    create: {
      name: 'Organization A',
      slug: 'org-a',
      // ... other fields
    },
  });

  // Seed users
  await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      name: 'Test User 1',
      passwordHash: '$2a$10$x/LUmyvwLsge.L16vqSgj.KAsZgsBovTQjk15HOUsMe2ZhPY8vy4W', // Use a proper hashing mechanism
      onboardingComplete: true,
      organizations: {
        create: {
          organizationId: org1.id,
          roles: ['ADMIN'],
          isDefault: true,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User Pickleball',
      passwordHash: '$2a$10$x/LUmyvwLsge.L16vqSgj.KAsZgsBovTQjk15HOUsMe2ZhPY8vy4W', // "password"
      emailVerified: true, // Assume verified for testing
      onboardingComplete: true,
      organizations: {
        create: {
          organizationId: org1.id, // Assign to the same org for simplicity
          roles: ['USER'],
          isDefault: true,
        },
      },
    },
  });

  // ... more seeding logic
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
