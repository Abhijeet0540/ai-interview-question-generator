import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})


const dbConnection = pool.connect().then(() => {
    console.log('Connected to the database✅');
    return dbConnection;
}).catch(err => {
    console.error('Error connecting to the database', err);
});

