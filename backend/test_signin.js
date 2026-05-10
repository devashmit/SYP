const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSignIn() {
    const API_URL = 'http://localhost:3000/api';
    const credentials = {
        email: 'devvv0264@gmail.com',
        password: '123456'
    };

    console.log(`🧪 Testing Sign-in for ${credentials.email}...`);

    try {
        const res = await fetch(`${API_URL}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await res.json();

        if (res.ok) {
            console.log('✅ Sign-in SUCCESS!');
            console.log('Token received:', data.token ? 'YES (truncated: ' + data.token.substring(0, 20) + '...)' : 'NO');
            console.log('User Role:', data.user?.role);
        } else {
            console.error('❌ Sign-in FAILED');
            console.error('Status:', res.status);
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('❌ Network/Request ERROR:', error.message);
    }
}

testSignIn();
