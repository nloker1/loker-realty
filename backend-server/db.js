const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Test the connection
pool.connect()
    .then(() => console.log("✅ PostgreSQL connected successfully!"))
    .catch(err => console.error("❌ PostgreSQL connection error:", err));

module.exports = pool;