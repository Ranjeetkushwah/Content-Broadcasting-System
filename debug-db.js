require('dotenv').config();
const { Pool } = require('pg');

console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'content_broadcasting',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    console.log('\nTesting database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('SUCCESS: Database connected!');
    console.log('Current time:', result.rows[0].now);
    
    // Check if database exists
    const dbCheck = await pool.query('SELECT current_database()');
    console.log('Current database:', dbCheck.rows[0].current_database);
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    console.log('Users table exists:', tableCheck.rows.length > 0);
    
    if (tableCheck.rows.length > 0) {
      // Test user creation
      console.log('\nTesting user creation...');
      try {
        const testUser = await pool.query(`
          INSERT INTO users (name, email, password_hash, role)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, email, role, created_at
        `, ['Test User', 'test@example.com', 'hashed_password', 'teacher']);
        console.log('Test user created:', testUser.rows[0]);
        
        // Clean up test user
        await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
        console.log('Test user cleaned up');
      } catch (userError) {
        console.error('User creation test failed:', userError.message);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    process.exit(1);
  }
}

testConnection();
