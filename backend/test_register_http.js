const test = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'New Provider Test 99',
                email: 'newprov_test99@example.com',
                password: 'password123',
                role: 'PROVIDER'
            })
        });
        const data = await response.json();
        console.log("STATUS:", response.status);
        console.log("RESPONSE:", data);
    } catch (e) {
        console.error(e);
    }
};
test();
