import dotenv from 'dotenv';
import path from 'path';

// Configure dotenv to use the .env file from the WiloV2 directory
// Ensure this is at the very top, before other imports
const envPath = path.join(process.cwd(), 'WiloV2', '.env');
dotenv.config({ path: envPath }); // This line loads the .env file

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { fileURLToPath } from 'url';
import configurePassport from './config/passport.js';
import { poolConnect } from './config/db.js';
import materialRoutes from './routes/materialRoutes.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import barcodeRoutes from './routes/barcodeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userManagementRoutes from './routes/userManagementRoutes.js';
import userRoutes from './routes/userRoutes.js';
import consumeRoutes from './routes/consumeRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Resolve file paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS first - ONLY ONE IS NEEDED
app.use(cors({
  origin: 'http://localhost:4200', // Ensure this matches your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport(); // This should now find the env variables

// Update root route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('http://localhost:4200/dashboard');
  } else {
    res.send('Logged out');
  }
});

app.use('/barcodes', express.static(path.join(__dirname, 'barcodes')));

// REMOVE THIS DUPLICATE CORS CONFIGURATION
// app.use(cors({
//   origin: 'http://localhost:4200', // Ensure this matches your frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

poolConnect
  .then(() => console.log('Connected to SQL Server'))
  .catch(err => console.error('Database connection failed:', err));

// Register routes
app.use('/api/materials', materialRoutes);
// Register routes
app.use('/auth', authRoutes);  // Ensure this matches the path used in your frontend
app.use('/api/transactions', transactionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/roleRoutes', roleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/print-barcode', barcodeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/user-management', userManagementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/consume', consumeRoutes);

// Error handler should be last
app.use(errorHandler);

app.use('/barcodes', express.static(path.join(__dirname, 'public', 'barcodes')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
