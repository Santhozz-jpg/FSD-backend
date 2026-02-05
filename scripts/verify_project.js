// verify_project.js
const http = require('http');

const baseURL = 'http://localhost:5000/api';

// Helper to make HTTP requests
const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                let parsedData = data;
                try {
                    parsedData = JSON.parse(data);
                } catch (e) {
                    // keep as string if not json
                }
                resolve({
                    status: res.statusCode,
                    data: parsedData
                });
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const runVerification = async () => {
    console.log('Starting Verification...');

    try {
        // 1. Health Check
        console.log('\n--- Checking Health ---');
        const health = await request('GET', '/health');
        console.log('Health Status:', health.status);
        if (health.status !== 200) throw new Error('Health check failed');

        // 2. Register Manager
        console.log('\n--- Registering Manager ---');
        const managerEmail = `manager_${Date.now()}@test.com`;
        const managerRes = await request('POST', '/auth/register', {
            name: "Manager Test",
            email: managerEmail,
            password: "password123",
            role: "MANAGER"
        });
        console.log('Manager Register Status:', managerRes.status);
        if (managerRes.status !== 201) throw new Error('Manager registration failed');

        // Login to get token (although register returns it? PRD says register returns userId, login returns token)
        // Oops, PRD says Register returns data: { userId, email... }, Login returns token.
        // So we must login.

        console.log('\n--- Logging in Manager ---');
        const loginManager = await request('POST', '/auth/login', {
            email: managerEmail,
            password: "password123"
        });
        console.log('Manager Login Status:', loginManager.status);
        const managerToken = loginManager.data.data.token;
        if (!managerToken) throw new Error('No manager token received');

        // 3. Register Staff
        console.log('\n--- Registering Staff ---');
        const staffEmail = `staff_${Date.now()}@test.com`;
        const staffRes = await request('POST', '/auth/register', {
            name: "Staff Test",
            email: staffEmail,
            password: "password123",
            role: "STAFF"
        });
        console.log('Staff Register Status:', staffRes.status);
        const staffId = staffRes.data.data.userId;

        // 4. Create Shift
        console.log('\n--- Creating Shift ---');
        // Start time: tomorrow 9am
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + 1);
        startTime.setHours(9, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(17, 0, 0, 0);

        const shiftRes = await request('POST', '/shifts', {
            title: "Test Shift",
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        }, managerToken);
        console.log('Create Shift Status:', shiftRes.status);
        if (shiftRes.status !== 201) throw new Error('Shift creation failed');
        const shiftId = shiftRes.data.data.shiftId;

        // 5. Assign Shift
        console.log('\n--- Assigning Shift ---');
        const assignRes = await request('POST', '/assignments', {
            shiftId,
            staffId
        }, managerToken);
        console.log('Assign Shift Status:', assignRes.status);
        if (assignRes.status !== 201) throw new Error('Shift assignment failed');

        // 6. Test Overlap
        console.log('\n--- Testing Overlap ---');
        // Overlapping shift: same day, 10am - 6pm (overlaps 9-5)
        const overlapStart = new Date(startTime);
        overlapStart.setHours(10, 0, 0, 0);
        const overlapEnd = new Date(startTime);
        overlapEnd.setHours(18, 0, 0, 0);

        // Create conflicting shift first
        const conflictShiftRes = await request('POST', '/shifts', {
            title: "Conflicting Shift",
            startTime: overlapStart.toISOString(),
            endTime: overlapEnd.toISOString()
        }, managerToken);
        const conflictShiftId = conflictShiftRes.data.data.shiftId;

        // Try to assign to same staff
        const overlapAssignRes = await request('POST', '/assignments', {
            shiftId: conflictShiftId,
            staffId
        }, managerToken);
        console.log('Overlap Assignment Status (Expected 409):', overlapAssignRes.status);
        if (overlapAssignRes.status === 409) {
            console.log('SUCCESS: Overlap detected correctly.');
        } else {
            console.log('FAILURE: Overlap not detected or other error.');
        }

    } catch (error) {
        console.error('Verification Failed:', error.message);
    }
};

// Wait for server to start if running via npm? 
// No, this script assumes server is running.
runVerification();
