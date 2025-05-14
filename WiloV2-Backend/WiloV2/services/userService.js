import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sql, pool, poolConnect } from '../config/db.js';

export const findOrCreateUser = async (profile) => {
  try {
    await poolConnect;

    // Check if user exists by provider ID first
    const userByProviderResult = await pool.request()
      .input('provider', sql.NVarChar(50), profile.provider)
      .input('providerId', sql.NVarChar(100), profile.providerId)
      .query('SELECT * FROM Users WHERE Provider = @provider AND ProviderID = @providerId');

    if (userByProviderResult.recordset.length > 0) {
      const user = userByProviderResult.recordset[0];
      return {
        id: user.UserID,
        email: user.Email,
        name: user.Name,
        provider: user.Provider,
        providerId: user.ProviderID,
        picture: user.ProfilePicture
      };
    }

    // Then check by email
    const userByEmailResult = await pool.request()
      .input('email', sql.NVarChar(100), profile.email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (userByEmailResult.recordset.length > 0) {
      // Update existing user with provider info if needed
      const existingUser = userByEmailResult.recordset[0];
      if (!existingUser.Provider) {
        await pool.request()
          .input('userId', sql.Int, existingUser.UserID)
          .input('provider', sql.NVarChar(50), profile.provider)
          .input('providerId', sql.NVarChar(100), profile.providerId)
          .query('UPDATE Users SET Provider = @provider, ProviderID = @providerId WHERE UserID = @userId');
      }
      return {
        id: existingUser.UserID,
        email: existingUser.Email,
        name: existingUser.Name,
        provider: existingUser.Provider,
        providerId: existingUser.ProviderID,
        picture: existingUser.ProfilePicture
      };
    }

    // Create new user if not found
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 12);

    const defaultRoleId = 2; // <-- Set this to your actual default RoleID
    const defaultDepartmentId = 1; // <-- Add a default DepartmentID

    const result = await pool.request()
      .input('email', sql.NVarChar(100), profile.email)
      .input('passwordHash', sql.NVarChar(256), passwordHash)
      .input('provider', sql.NVarChar(50), profile.provider)
      .input('providerId', sql.NVarChar(100), profile.providerId)
      .input('name', sql.NVarChar(100), profile.name || null)
      .input('picture', sql.NVarChar(256), profile.picture || null)
      .input('roleId', sql.Int, defaultRoleId)
      .input('departmentId', sql.Int, defaultDepartmentId) // <-- Add this line
      .query(`
        INSERT INTO Users (Email, PasswordHash, Provider, ProviderID, Name, ProfilePicture, RoleID, DepartmentID)
        OUTPUT INSERTED.UserID
        VALUES (@email, @passwordHash, @provider, @providerId, @name, @picture, @roleId, @departmentId)
      `);

    const newUserId = result.recordset[0].UserID;

    // Create employee record if name is provided
    if (profile.name) {
      await pool.request()
        .input('UserID', sql.Int, newUserId)
        .input('EmployeeName', sql.NVarChar(100), profile.name)
        .query('INSERT INTO Employees (UserID, EmployeeName) VALUES (@UserID, @EmployeeName)');
    }

    return {
      id: newUserId,
      email: profile.email,
      name: profile.name || null,
      provider: profile.provider,
      providerId: profile.providerId,
      picture: profile.picture || null
    };
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

export const findUserById = async (id) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('userId', sql.Int, id)
      .query('SELECT * FROM Users WHERE UserID = @userId');
    
    const user = result.recordset[0];
    if (!user) return null;
    return {
      id: user.UserID,
      email: user.Email,
      name: user.Name,
      provider: user.Provider,
      providerId: user.ProviderID,
      picture: user.ProfilePicture
    };
  } catch (error) {
    console.error('Error in findUserById:', error);
    throw error;
  }
};