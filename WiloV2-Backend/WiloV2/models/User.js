import { sql, pool, poolConnect } from '../config/db.js';

class User {
  static async findOne(query) {
    await poolConnect;
    
    try {
      let request = pool.request();
      let whereClause = [];
      
      // Build where clause based on query parameters
      if (query.email) {
        whereClause.push('Email = @Email');
        request.input('Email', sql.NVarChar, query.email);
      }
      
      if (query.provider && query.providerId) {
        whereClause.push('Provider = @Provider AND ProviderID = @ProviderID');
        request.input('Provider', sql.NVarChar, query.provider);
        request.input('ProviderID', sql.NVarChar, query.providerId);
      }
      
      if (whereClause.length === 0) {
        throw new Error('No search criteria provided');
      }
      
      const sqlQuery = `
        SELECT UserID, Email, PasswordHash, RoleID, DepartmentID, LastLogin, IsActive, 
               Provider, ProviderID, Name, ProfilePicture
        FROM Users 
        WHERE ${whereClause.join(' AND ')}
      `;
      
      const result = await request.query(sqlQuery);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      return new User(result.recordset[0]);
    } catch (error) {
      console.error('Error in User.findOne:', error);
      throw error;
    }
  }

  static async findById(id) {
    await poolConnect;
    
    try {
      const request = pool.request();
      request.input('UserID', sql.Int, id);
      
      const result = await request.query(`
        SELECT UserID, Email, PasswordHash, RoleID, DepartmentID, LastLogin, IsActive, 
               Provider, ProviderID, Name, ProfilePicture
        FROM Users 
        WHERE UserID = @UserID
      `);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      return new User(result.recordset[0]);
    } catch (error) {
      console.error('Error in User.findById:', error);
      throw error;
    }
  }

  async save() {
    await poolConnect;
    
    try {
      const request = pool.request();
      
      // If user has an ID, update existing record
      if (this.id) {
        request.input('UserID', sql.Int, this.id);
        request.input('Email', sql.NVarChar, this.email);
        request.input('LastLogin', sql.DateTime, this.lastLogin);
        request.input('IsActive', sql.Bit, this.isActive ? 1 : 0);
        request.input('Provider', sql.NVarChar, this.provider);
        request.input('ProviderID', sql.NVarChar, this.providerId);
        request.input('Name', sql.NVarChar, this.name);
        request.input('ProfilePicture', sql.NVarChar, this.profilePicture);
        
        await request.query(`
          UPDATE Users 
          SET Email = @Email,
              LastLogin = @LastLogin,
              IsActive = @IsActive,
              Provider = @Provider,
              ProviderID = @ProviderID,
              Name = @Name,
              ProfilePicture = @ProfilePicture
          WHERE UserID = @UserID
        `);
        
        return this;
      } 
      // Otherwise insert new user
      else {
        request.input('Email', sql.NVarChar, this.email);
        request.input('LastLogin', sql.DateTime, this.lastLogin);
        request.input('IsActive', sql.Bit, this.isActive ? 1 : 0);
        request.input('Provider', sql.NVarChar, this.provider);
        request.input('ProviderID', sql.NVarChar, this.providerId);
        request.input('Name', sql.NVarChar, this.name);
        request.input('ProfilePicture', sql.NVarChar, this.profilePicture);
        
        const result = await request.query(`
          INSERT INTO Users (
            Email, LastLogin, IsActive, Provider, ProviderID, Name, ProfilePicture
          )
          OUTPUT INSERTED.UserID
          VALUES (
            @Email, @LastLogin, @IsActive, @Provider, @ProviderID, @Name, @ProfilePicture
          )
        `);
        
        this.id = result.recordset[0].UserID;
        return this;
      }
    } catch (error) {
      console.error('Error in User.save:', error);
      throw error;
    }
  }

  constructor(userData) {
    this.id = userData.UserID || userData.id;
    this.email = userData.email || userData.Email;
    this.name = userData.name || userData.Name;
    this.provider = userData.provider || userData.Provider;
    this.providerId = userData.providerId || userData.ProviderID;
    this.profilePicture = userData.picture || userData.ProfilePicture;
    this.lastLogin = userData.LastLogin || new Date();
    this.isActive = userData.IsActive !== undefined ? userData.IsActive : true;
    this.roleId = userData.RoleID;
    this.departmentId = userData.DepartmentID;
    this.passwordHash = userData.PasswordHash;
  }
}

export default User;