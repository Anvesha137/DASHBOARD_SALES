
// Node 18+ has native fetch.

const BASE_URL = 'http://localhost:3001/api';

async function testFetch() {
    console.log('--- Testing API Data Fetch ---');

    try {
        // 1. Login
        console.log('1. Attempting Login...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@saaspro.com', password: 'password123' })
        });

        if (!loginRes.ok) {
            throw new Error(`Login Failed: ${loginRes.status} ${loginRes.statusText}`);
        }

        const authData = await loginRes.json();
        const token = authData.accessToken;
        console.log(`✓ Login Successful. Token obtained.`);

        // 2. Fetch Users
        console.log('2. Fetching Users...');
        const usersRes = await fetch(`${BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!usersRes.ok) {
            throw new Error(`Fetch Users Failed: ${usersRes.status} ${usersRes.statusText}`);
        }

        const users = await usersRes.json();
        console.log(`✓ Users Fetched: ${users.length} records found.`);
        if (users.length > 0) {
            console.log('Sample User:', JSON.stringify(users[0], null, 2));
        }

        // 3. Fetch Expenses
        console.log('3. Fetching Expenses...');
        const expRes = await fetch(`${BASE_URL}/expenses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const expenses = await expRes.json();
        console.log(`✓ Expenses Fetched: ${expenses.length} records found.`);

        // 4. Fetch Notifications
        console.log('4. Fetching Notifications...');
        const notifRes = await fetch(`${BASE_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const notifs = await notifRes.json();
        console.log(`✓ Notifications Fetched: ${notifs.length} records found.`);

    } catch (err) {
        console.error('❌ Test Failed:', err.message);
    }
}

testFetch();
