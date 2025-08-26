const http = require('http');

// Debug test to see what's happening with user-based rate limiting
async function debugUserRateLimiting() {
  console.log('🔍 Debugging User-Based Rate Limiting...\n');
  
  const testEmail = 'test2@example.com';
  const correctPassword = 'password123';
  const wrongPassword = 'wrongpassword';
  
  // Test 1: Reset counter with successful login
  console.log('📋 Test 1: Reset counter with successful login');
  try {
    const response = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: correctPassword
    }, '192.168.2.1');
    console.log('✅ Success - Login successful');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  // Test 2: Make 1 failed attempt and check user status
  console.log('\n📋 Test 2: Make 1 failed attempt and check user status');
  try {
    const response = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: wrongPassword
    }, '192.168.2.2');
    console.log('❌ Unexpected success - should have failed');
  } catch (error) {
    if (error.statusCode === 401) {
      console.log('✅ Got 401 - Invalid credentials');
      console.log('Error message:', error.message);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
  
  // Test 3: Get current user to see failed login attempts count
  console.log('\n📋 Test 3: Get current user to check failed login attempts');
  try {
    // First login to get a token
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: correctPassword
    }, '192.168.2.3');
    
    const token = loginResponse.data.token;
    console.log('✅ Got token for user');
    
    // Now get user details
    const userResponse = await makeRequest('/api/auth/me', 'GET', null, '192.168.2.4', token);
    console.log('✅ Got user details');
    console.log('User data:', JSON.stringify(userResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error getting user details:', error.message);
  }
  
  console.log('\n🎉 Debug test completed!');
}

function makeRequest(path, method, data, fakeIP = '127.0.0.1', token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': fakeIP,
        'X-Real-IP': fakeIP
      }
    };
    
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } else {
          reject({ statusCode: res.statusCode, message: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run the debug test
debugUserRateLimiting().catch(console.error);
