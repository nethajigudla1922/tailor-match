const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'netaji@gmail.com';
  const password = '12345678';
  
  console.log('Seeding super admin account...');
  
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existingUser) {
    console.log('Admin user already exists. Updating role to ADMIN...');
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log('Admin user updated successfully.');
    return;
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email,
      passwordHash,
      role: 'ADMIN'
    }
  });
  
  console.log('Super admin account created successfully:', admin.id);
}

main()
  .catch((e) => {
    console.error('Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
