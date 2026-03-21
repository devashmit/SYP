const prisma = require('./prisma/client');

async function main() {
  const users = await prisma.profile.findMany();
  console.log('Total users:', users.length);
  users.forEach(u => console.log(`- ${u.email} (role: ${u.role})`));
}
main()
  .catch(e => console.error(e))
  .finally(() => process.exit(0));
