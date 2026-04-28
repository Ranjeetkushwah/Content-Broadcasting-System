require('dotenv').config();
const { Pool } = require('pg');

// Connect to default postgres database to create our database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres', // Connect to default database
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function createDatabase() {
  try {
    console.log('Creating database "content_broadcasting"...');
    await pool.query('CREATE DATABASE content_broadcasting');
    console.log('Database created successfully!');
    
    // Close connection
    await pool.end();
    
    // Now initialize the database schema
    console.log('\nInitializing database schema...');
    const initDatabase = require('./src/models/initDatabase').initializeDatabase;
    await initDatabase();
    console.log('Database schema initialized successfully!');
    
    process.exit(0);
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database already exists. Initializing schema...');
      // Database exists, just initialize schema
      await pool.end();
      const initDatabase = require('./src/models/initDatabase').initializeDatabase;
      await initDatabase();
      console.log('Database schema initialized successfully!');
      process.exit(0);
    } else {
      console.error('Error creating database:', error.message);
      console.error('Error code:', error.code);
      process.exit(1);
    }
  }
}

createDatabase();
