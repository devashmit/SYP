const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    // 1. Categories
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

    const healthCat = await prisma.category.findUnique({ where: { name: 'Health' } });
    const eduCat = await prisma.category.findUnique({ where: { name: 'Education' } });
    const shelterCat = await prisma.category.findUnique({ where: { name: 'Shelter' } });
    const foodCat = await prisma.category.findUnique({ where: { name: 'Food' } });
    const essentialsCat = await prisma.category.findUnique({ where: { name: 'Essentials' } });

    // 2. Ensure an author profile exists
    let author = await prisma.profile.findUnique({ where: { email: 'seeduser@sahayogi.org' } });
    if (!author) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        author = await prisma.profile.create({
            data: {
                email: 'seeduser@sahayogi.org',
                username: 'SahayogiVolunteer',
                password: hashedPassword,
                full_name: 'Sahayogi Seed User',
                role: 'donor',
                location: 'Kathmandu'
            }
        });
    }

    // 3. Clear existing generic posts to avoid duplicates
    // Delete in proper order to avoid foreign key errors
    await prisma.notification.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});

    console.log('Cleared existing posts, comments, and notifications.');

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
        }
    ];

    for (const post of newPosts) {
        await prisma.post.create({ data: post });
    }

    console.log('Successfully seeded database with realistic causes.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
