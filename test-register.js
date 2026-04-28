require('dotenv').config();

const testRegistration = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Ranjeet',
        email: 'ranjeetkushwah@yopmail.com',
        password: 'Password@123',
        role: 'principal'
      })
    });

    const result = await response.json();
    console.log('Registration response:', response.status);
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testRegistration();
