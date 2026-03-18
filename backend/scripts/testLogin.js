import axios from 'axios';

async function testLogin() {
  const email = 'admin@iphonemobileceylon.com';
  const password = 'P@$$w0rd';

  console.log('Testing login for:', email);

  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    console.log('Login Success:', response.data);
  } catch (error) {
    console.log('Login Failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
