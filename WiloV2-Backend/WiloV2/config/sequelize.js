// ./config/sequelize.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.WilloV2,          // Database name from .env (WilloV2)
  process.env.sa,          // Database username from .env (sa)
  process.env.sipamara,      // Database password from .env (sipamara)
  {
    host: process.env.localhost,  // Database server from .env (localhost)
    port: 1434,      // Database port from .env (1434)
    dialect: 'mssql',             // Using Microsoft SQL Server
    dialectOptions: {
      options: {
        encrypt: true,             // Use encryption if required by your server
        trustServerCertificate: true // Change to false for production environments
      }
    },
    pool: {
      max: 5,           // Maximum number of connections in pool
      min: 0,           // Minimum number of connections in pool
      acquire: 30000,   // Maximum time (ms) to try getting a connection before throwing an error
      idle: 10000       // Maximum time (ms) that a connection can be idle before being released
    },
    logging: false      // Disable SQL query logging (set to console.log to enable)
  }
);

export default sequelize;
