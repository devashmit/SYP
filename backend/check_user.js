const prisma = require('./prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const email = 'dev6111@gmail.com';
  const user = await prisma.profile.findUnique({ where: { email } });
  console.log('User found:', user ? 'Yes' : 'No');
  if (user) {
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('User Role:', user.role);
    // Let's also check if hashing works
    console.log('Password hash looks like:', user.password.substring(0, 10) + '...');
  }
}
main()
  .catch(e => console.error(e))
  .finally(() => process.exit(0));
