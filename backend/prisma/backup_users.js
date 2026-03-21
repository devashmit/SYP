const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function backupUsers() {
  console.log('Starting user data backup...');
  try {
    const users = await prisma.profile.findMany();
    const backupDir = path.join(__dirname, 'backups');
    
    if (!fs.existsSync(backupDir)){
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `users_backup_${dateStr}.json`);
    
    fs.writeFileSync(backupPath, JSON.stringify(users, null, 2));
    console.log(`✅ Success: ${users.length} users backed up to ${backupPath}`);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupUsers();
