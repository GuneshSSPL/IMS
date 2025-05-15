// ./config/sequelize.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules, __dirname is not available directly, so we derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the parent directory (WiloV2) relative to this config file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- BEGIN DEBUG LOGS ---
console.log("--- Environment Variables for Sequelize ---");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "********" : undefined); // Don't log actual password
console.log("DB_SERVER:", process.env.DB_SERVER);
console.log("DB_PORT (raw):", process.env.DB_PORT);
const portToUse = parseInt(process.env.DB_PORT) || 1433;
console.log("DB_PORT (parsed to use):", portToUse);
console.log("-----------------------------------------");
// --- END DEBUG LOGS ---

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    port: portToUse, // Use the debugged portToUse variable
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: true,             // Use encryption if required by your server (common for Azure SQL)
        trustServerCertificate: true // For local dev; set to false for production with a valid cert
      }
    },
    pool: {
      max: 5,           // Maximum number of connections in pool
      min: 0,           // Minimum number of connections in pool
      acquire: 30000,   // Maximum time (ms) to try getting a connection before throwing an error
      idle: 10000       // Maximum time (ms) that a connection can be idle before being released
    },
    logging: console.log // Enable logging to see SQL queries (or set to false to disable)
  }
);

export default sequelize;
