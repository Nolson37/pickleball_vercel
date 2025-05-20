// Script to verify a user's email in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUser(email) {
  try {
    // Update the user's emailVerified field
    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        onboardingComplete: false
      },
    });

    console.log(`User ${email} has been verified.`);
    console.log(user);
    
    return user;
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function with the email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as an argument.');
  process.exit(1);
}

verifyUser(email)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));