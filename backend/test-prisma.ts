import { prisma } from './src/config/database';

async function test() {
  try {
    console.log('Testing Prisma connection...');
    
    // Try to count users
    const count = await prisma.user.count();
    console.log(`User count: ${count}` );
    
    console.log('Prisma connection successful!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
