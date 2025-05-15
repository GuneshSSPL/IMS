import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env'); 
dotenv.config({ path: envPath }); 

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './config/passport.js';
import { poolConnect } from './config/db.js';

// Import your chosen authentication middleware
import { authenticate } from './middleware/auth.js'; // Using authenticate from auth.js

// Route imports
import materialRoutes from './routes/materialRoutes.js';
import authRoutes from './routes/authRoutes.js'; // Public routes
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

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Root route (public)
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('http://localhost:4200/dashboard');
  } else {
    res.send('Logged out');
  }
});

// Public routes (authentication, registration, OAuth callbacks)
app.use('/auth', authRoutes); 

// Static assets (public)
app.use('/barcodes', express.static(path.join(__dirname, 'public', 'barcodes')));

// Apply authentication middleware to all /api routes
app.use('/api', authenticate); // <<< ALL ROUTES STARTING WITH /api WILL NOW REQUIRE AUTHENTICATION

// Register API routes (they will inherit the /api prefix and the authenticate middleware)
app.use('/api/materials', materialRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/roleRoutes', roleRoutes); // Consider renaming to /api/roles
app.use('/api/departments', departmentRoutes);
app.use('/api/print-barcode', barcodeRoutes); // Consider renaming to /api/barcodes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/user-management', userManagementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/consume', consumeRoutes);

// Error handler should be last
app.use(errorHandler);

poolConnect
  .then(() => console.log('Connected to SQL Server'))
  .catch(err => console.error('Database connection failed:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
