const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting safe database seed...');

    // ─── 1. Categories (upsert — safe, never loses data) ─────────────
    const categories = [
        { name: 'Health', description: 'Medical emergencies, surgeries, treatments' },
        { name: 'Education', description: 'School fees, college materials, books' },
        { name: 'Shelter', description: 'Disaster relief, safe homes, housing' },
        { name: 'Food', description: 'Monthly rations, emergency meals, groceries' },
        { name: 'Essentials', description: 'Daily care, clothing, basic needs' }
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: { description: cat.description },
            create: cat,
        });
    }
    console.log('✅ Categories seeded');

    // ─── 2. Admin user (upsert — safe) ───────────────────────────────
    const adminPassword = await bcrypt.hash('123456', 10);
    await prisma.profile.upsert({
        where: { email: 'devvv0264@gmail.com' },
        update: { role: 'admin' }, // Ensure admin role is always set
        create: {
            email: 'devvv0264@gmail.com',
            username: 'devvv_admin',
            password: adminPassword,
            full_name: 'Dev Admin',
            role: 'admin',
            location: 'Kathmandu'
        }
    });
    console.log('✅ Admin user seeded (devvv0264@gmail.com)');

    // ─── 3. Seed volunteer user (upsert — safe) ─────────────────────
    const volunteerPassword = await bcrypt.hash('password123', 10);
    const author = await prisma.profile.upsert({
        where: { email: 'seeduser@sahayogi.org' },
        update: {},
        create: {
            email: 'seeduser@sahayogi.org',
            username: 'SahayogiVolunteer',
            password: volunteerPassword,
            full_name: 'Sahayogi Seed User',
            role: 'donor',
            location: 'Kathmandu'
        }
    });

    // ─── 4. Dev test user (upsert — safe) ────────────────────────────
    const devPassword = await bcrypt.hash('123456', 10);
    await prisma.profile.upsert({
        where: { email: 'dev6111@gmail.com' },
        update: {},
        create: {
            email: 'dev6111@gmail.com',
            username: 'DevTestUser',
            password: devPassword,
            full_name: 'Developer Testing',
            role: 'donor',
            location: 'Kathmandu'
        }
    });
    console.log('✅ Test users seeded');

    // ─── 5. Seed community need posts (only if none exist) ───────────
    const existingPostCount = await prisma.post.count();
    if (existingPostCount > 0) {
        console.log(`ℹ️  Skipping post seeding — ${existingPostCount} posts already exist`);
    } else {
        const healthCat = await prisma.category.findUnique({ where: { name: 'Health' } });
        const eduCat = await prisma.category.findUnique({ where: { name: 'Education' } });
        const shelterCat = await prisma.category.findUnique({ where: { name: 'Shelter' } });
        const foodCat = await prisma.category.findUnique({ where: { name: 'Food' } });

        const newPosts = [
            {
                title: 'Domestic abuse survivors need safe shelter + essentials',
                description: 'A local safe house is currently hosting 15 survivors and they urgently need funds for rent, warm blankets, and trauma counseling resources. Single mothers with children make up 70% of those sheltered.',
                help_type: 'request',
                post_type: 'community_need',
                location: 'Kathmandu',
                category_id: shelterCat.id,
                images: ['/images/hero/Human-touch-and-social-work-1024x1024.jpg'],
                user_id: author.id,
                status: 'available',
            },
            {
                title: 'Old-age home monthly food + medicine support',
                description: 'The Aama Buwa Ashram is struggling to meet this month\'s grocery and prescription medication needs for 25 elderly residents. Looking for monthly sponsors or one-time food drops.',
                help_type: 'request',
                post_type: 'community_need',
                location: 'Lalitpur',
                category_id: healthCat.id,
                images: ['/images/hero/boudhanath-stupa-in-kathmandu-nepal.webp'],
                user_id: author.id,
                status: 'available',
            },
            {
                title: 'Orphan home winter supplies + school materials',
                description: 'As winter approaches, 40 children at the Bal Mandir need warm jackets, shoes, and fresh notebooks for the upcoming school term. Many children share a single blanket.',
                help_type: 'request',
                post_type: 'community_need',
                location: 'Bhaktapur',
                category_id: eduCat.id,
                images: ['/images/hero/VyzziCJ0Q5j5dIy7AvHMlrVQ6sg4FBVmPnfCl2YF.jpg'],
                user_id: author.id,
                status: 'available',
            },
            {
                title: 'Flood/landslide victim emergency relief',
                description: 'Recent landslides in Sindhupalchok have displaced 12 families. They desperately need tents, dry rations (Chura, Noodles), and clean drinking water immediately.',
                help_type: 'request',
                post_type: 'community_need',
                location: 'Sindhupalchok',
                category_id: shelterCat.id,
                images: ['/images/hero/Human-touch-and-social-work-1024x1024.jpg'],
                user_id: author.id,
                status: 'available',
            },
            {
                title: 'Family support after sole earner passed away',
                description: 'A family of 4 lost their father in a recent accident. The mother needs immediate financial support for groceries and to keep her two kids in school for the next three months while she finds work.',
                help_type: 'request',
                post_type: 'community_need',
                location: 'Pokhara',
                category_id: foodCat.id,
                images: ['/images/hero/boudhanath-stupa-in-kathmandu-nepal.webp'],
                user_id: author.id,
                status: 'available',
            },
            {
                title: 'Accident survivor who lost limbs needs prosthetic + rehab',
                description: 'A 28-year-old construction worker lost his arm in a worksite accident. We are raising funds for a prosthetic fitment and 3 months of physical therapy at Bir Hospital.',
                help_type: 'request',
                post_type: 'community_need',
                location: 'Chitwan',
                category_id: healthCat.id,
                images: ['/images/hero/VyzziCJ0Q5j5dIy7AvHMlrVQ6sg4FBVmPnfCl2YF.jpg'],
                user_id: author.id,
                status: 'available',
            },
            {
                title: 'Emergency surgery / hospital bill support',
                description: 'Raising funds to cover ICU and emergency appendectomy surgery bills for a daily-wage laborer who cannot afford the hospital deposit of Rs. 80,000.',
                help_type: 'request',
                post_type: 'community_need',
                location: 'Dharan',
                category_id: healthCat.id,
                images: ['/images/hero/Human-touch-and-social-work-1024x1024.jpg'],
                user_id: author.id,
                status: 'available',
            },
            {
                title: 'Student school/college fee + books support',
                description: 'A brilliant Grade +2 Science student from a low-income family is about to drop out due to unpaid tuition. Needs Rs. 15,000 to clear dues and buy reference books.',
                help_type: 'request',
                post_type: 'community_need',
                location: 'Kathmandu',
                category_id: eduCat.id,
                images: ['/images/hero/boudhanath-stupa-in-kathmandu-nepal.webp'],
                user_id: author.id,
                status: 'available',
            }
        ];

        for (const post of newPosts) {
            await prisma.post.create({ data: post });
        }
        console.log('✅ Community need posts seeded');
    }

    console.log('🎉 Database seed complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
