import { sql, pool, poolConnect } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

  export const register = async (req, res) => {
    try {
      const { employeeName, email, password, roleId, departmentId } = req.body || {};

      if (!employeeName || !email || !password || !roleId || !departmentId) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const userCheck = await pool.request()
        .input('email', sql.NVarChar(100), email)
        .query('SELECT * FROM Users WHERE Email = @email');

      if (userCheck.recordset.length > 0) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const userInsertQuery = `
        INSERT INTO Users (Email, PasswordHash, RoleID, DepartmentID)
        OUTPUT INSERTED.UserID
        VALUES (@Email, @PasswordHash, @RoleID, @DepartmentID)
      `;

      const userInsertResult = await pool.request()
        .input('Email', sql.NVarChar(100), email)
        .input('PasswordHash', sql.NVarChar(256), hashedPassword)
        .input('RoleID', sql.Int, roleId)
        .input('DepartmentID', sql.Int, departmentId)
        .query(userInsertQuery);

      const newUserId = userInsertResult.recordset[0].UserID;

      await pool.request()
        .input('UserID', sql.Int, newUserId)
        .input('EmployeeName', sql.NVarChar(100), employeeName)
        .query('INSERT INTO Employees (UserID, EmployeeName) VALUES (@UserID, @EmployeeName)');

      const token = jwt.sign(
        { userId: newUserId, email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({ token });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email and join with Roles table to get RoleName
    const userResult = await pool.request()
      .input('email', sql.NVarChar(100), email)
      .query(`
        SELECT u.UserID, u.Email, u.PasswordHash, u.RoleID, r.RoleName 
        FROM Users u 
        LEFT JOIN Roles r ON u.RoleID = r.RoleID 
        WHERE u.Email = @email
      `);
    
    const user = userResult.recordset[0];
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (user not found)' });
    }
    
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (password mismatch)' });
    }
    
    // Create JWT payload
    const payload = {
      userId: user.UserID,
      email: user.Email,
      Role: user.RoleName // Use RoleName for consistency with authorize middleware
    };
    
    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token: token
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};



export const rfidLogin = async (req, res) => {
  try {
    const { rfid } = req.body || {};

    if (!rfid) {
      return res.status(400).json({ message: 'RFID is required' });
    }

    const employeeResult = await pool.request()
      .input('rfid', sql.NVarChar(100), rfid)
      .query('SELECT * FROM Employees WHERE RFID = @rfid');

    const employee = employeeResult.recordset[0];
    if (!employee) {
      return res.status(404).json({ message: 'RFID not found' });
    }

    const userResult = await pool.request()
      .input('userId', sql.Int, employee.UserID)
      .query('SELECT * FROM Users WHERE UserID = @userId');

    const user = userResult.recordset[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found for the given RFID' });
    }

    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, roleId: user.RoleID },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('RFID Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req, res) => {
  const userId = req.params.id;
  const { roleId } = req.body;

  if (!roleId) {
    return res.status(400).json({ message: 'RoleID is required' });
  }

  try {
    await poolConnect;
    await pool.request()
      .input('UserID', sql.Int, userId)
      .input('RoleID', sql.Int, roleId)
      .query('UPDATE Users SET RoleID = @RoleID WHERE UserID = @UserID');

    res.status(200).json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all users with their roles
 */
export const getAllUsers = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT 
        u.UserID, 
        u.Email, 
        u.RoleID, 
        r.RoleName 
      FROM Users u
      LEFT JOIN Roles r ON u.RoleID = r.RoleID
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req, res) => {
  try {
    await poolConnect;

    console.log('Decoded JWT payload:', req.user); // Debug line

    const result = await pool.request()
      .input('UserID', sql.Int, req.user.userId) // ✅ Use userId here
      .query(`
        SELECT 
          u.UserID, 
          u.Email, 
          u.RoleID, 
          r.RoleName 
        FROM Users u
        LEFT JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.UserID = @UserID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Add this function to your existing userController.js

export const authCallback = (req, res) => {
  const token = generateToken(req.user);
  
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}/auth-callback?token=${token}`);
};

// Make sure you have a generateToken function in your controller
// If not, add something like this:
const generateToken = (user) => {
  // Use your existing JWT token generation logic
  // Example:
  return jwt.sign(
    { id: user.id, email: user.email, role: user.roleId },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '1d' }
  );
};


export const logout = (req, res) => {
  // Clear the user session
  req.logout(function(err) {
    if (err) { return next(err); }
    
    // Redirect to Auth0 logout URL
    const returnTo = encodeURIComponent('http://localhost:5000');
    const logoutURL = `https://${process.env.AUTH0_ISSUER_BASE_URL.replace('https://', '').trim()}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${returnTo}`;
    
    res.redirect(logoutURL);
  });
};

  