// testConnection.js

// Import the mssql package
const sql = require('mssql');

// Define your SQL Server configuration
const config = {
  user: 'sa',             // Replace with your SQL Server username
  password: 'sipamara',         // Replace with your SQL Server password
  server: 'localhost',              // Use localhost since SQL Server listens on loopback (127.0.0.1)
  port: 1434,                       // Use the port your SQL Server is listening on (1434)
  database: 'WilloV2',     // Replace with the name of your database
  options: {
    encrypt: false,                 // Set to true if encryption is required
    trustServerCertificate: true    // Required if using a self-signed certificate in development
  }
};

async function testConnection() {
  try {
    // Establish connection to SQL Server
    let pool = await sql.connect(config);
    console.log('Connected successfully to SQL Server on port 1434');

    // Run a simple test query
    let result = await pool.request().query('SELECT GETDATE() as CurrentDate');
    console.log('Query result:', result.recordset);

    // Close the connection pool
    await sql.close();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// Execute the test connection function
testConnection();
