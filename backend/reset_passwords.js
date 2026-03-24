const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting password reset for all users...');
    
    const users = await prisma.profile.findMany();
    console.log(`Found ${users.length} users.`);
    
    const newPassword = await bcrypt.hash('123456', 10);
    
    let updatedCount = 0;
    for (const user of users) {
        try {
            await prisma.profile.update({
                where: { id: user.id },
                data: { password: newPassword }
            });
            console.log(`✅ Updated password for: ${user.email}`);
            updatedCount++;
        } catch (error) {
            console.error(`❌ Failed to update ${user.email}:`, error.message);
        }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount}/${users.length} user passwords to "123456"`);
}

main()
    .catch((e) => {
        console.error('❌ Reset script failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
