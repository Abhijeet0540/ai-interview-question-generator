import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.postgres.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Execute the schema
      await client.query(schema);
      console.log('Database tables created successfully!');
    } finally {
      client.release();
    }
    
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the initialization
initializeDatabase();