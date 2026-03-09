const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'devvv0264@gmail.com';
    const user = await prisma.profile.findUnique({ where: { email } });

    if (user) {
        await prisma.profile.update({
            where: { email },
            data: { role: 'admin' }
        });
        console.log(`SUCCESS: User ${email} has been elevated to ADMIN.`);
    } else {
        console.log(`INFO: User ${email} not found. They will be auto-assigned ADMIN role when they sign up.`);
    }
}

main()
    .catch((e) => {
        console.error('ERROR elevating user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
