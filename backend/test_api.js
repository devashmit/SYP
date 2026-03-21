require('dotenv').config();
const jwt = require('jsonwebtoken');
const prisma = require('./prisma/client');

async function testApi() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found");
        return process.exit(1);
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    console.log("Testing API as:", user.username);

    try {
        const res = await fetch('http://localhost:3000/api/conversations', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const text = await res.text();
        console.log("API Response:", text.substring(0, 500));
    } catch (err) {
        console.log("API Error:", err);
    } finally {
        process.exit(0);
    }
}

testApi();
