const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log('Messages:', await prisma.message.count());
    console.log('Users:', await prisma.user.count());
}
main().finally(() => prisma.$disconnect());
