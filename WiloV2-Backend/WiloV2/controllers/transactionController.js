import { pool, sql } from '../config/db.js';

// Create Inward Transaction
export const createInwardTransaction = async (req, res) => {
  await handleTransaction(req, res, 'INWARD');
};

// Create Consumption Transaction
export const createConsumptionTransaction = async (req, res) => {
  await handleTransaction(req, res, 'CONSUMPTION');
};

// Common Handler
const handleTransaction = async (req, res, type) => {
  try {
    const { materialId, quantity, referenceDocument } = req.body;
    const userId = req.user.userId;

    if (!materialId || !quantity) {
      return res.status(400).json({ message: 'Material ID and quantity are required' });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Insert transaction
      await transaction.request()
        .input('MaterialID', sql.Int, materialId)
        .input('UserID', sql.Int, userId)
        .input('TransactionType', sql.VarChar, type)
        .input('Quantity', sql.Int, quantity)
        .input('ReferenceDocument', sql.VarChar, referenceDocument)
        .query(`
          INSERT INTO dbo.InventoryTransactions 
          (MaterialID, UserID, TransactionType, Quantity, ReferenceDocument)
          VALUES (@MaterialID, @UserID, @TransactionType, @Quantity, @ReferenceDocument)
        `);

      const operator = type === 'INWARD' ? '+' : '-';

      // Update stock
      await transaction.request()
        .input('MaterialID', sql.Int, materialId)
        .input('Quantity', sql.Int, quantity)
        .query(`
          UPDATE dbo.Materials 
          SET CurrentQuantity = CurrentQuantity ${operator} @Quantity
          WHERE MaterialID = @MaterialID
        `);

      await transaction.commit();
      res.status(201).json({ message: `${type} transaction recorded successfully` });
    } catch (error) {
      await transaction.rollback();
      console.error(`${type} Transaction Error:`, error);
      res.status(500).json({ message: 'Transaction failed' });
    }

  } catch (error) {
    console.error(`${type} Error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getInwardTransactions = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        t.TransactionID,
        t.TransactionType,
        t.Quantity,
        t.TransactionDate,
        t.ReferenceDocument,
        m.MaterialCode,
        m.Description,
        u.Email AS PerformedBy
      FROM dbo.InventoryTransactions t
      JOIN dbo.Materials m ON t.MaterialID = m.MaterialID
      JOIN dbo.Users u ON t.UserID = u.UserID
      WHERE t.TransactionType = 'INWARD'
      ORDER BY t.TransactionDate DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching inward transactions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Transactions
export const getAllTransactions = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        t.TransactionID,
        t.TransactionType,
        t.Quantity,
        t.TransactionDate,
        t.ReferenceDocument,
        m.MaterialCode,
        m.Description,
        u.Email AS PerformedBy
      FROM dbo.InventoryTransactions t
      JOIN dbo.Materials m ON t.MaterialID = m.MaterialID
      JOIN dbo.Users u ON t.UserID = u.UserID
      ORDER BY t.TransactionDate DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Transaction History Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Daily Report
export const getDailyReport = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        CAST(TransactionDate AS DATE) AS Date,
        TransactionType,
        SUM(Quantity) AS TotalQuantity
      FROM dbo.InventoryTransactions
      WHERE CAST(TransactionDate AS DATE) = CAST(GETDATE() AS DATE)
      GROUP BY CAST(TransactionDate AS DATE), TransactionType
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Daily Report Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Monthly Summary
export const getMonthlySummary = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        FORMAT(TransactionDate, 'yyyy-MM') AS Month,
        TransactionType,
        SUM(Quantity) AS TotalQuantity
      FROM dbo.InventoryTransactions
      WHERE TransactionDate >= DATEADD(MONTH, -6, GETDATE())
      GROUP BY FORMAT(TransactionDate, 'yyyy-MM'), TransactionType
      ORDER BY Month DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Monthly Summary Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
 

export const consumeMaterialByQR = async (req, res) => {
  try { 
    const { scannedCode, quantity, userId, machineId, departmentId, referenceDoc } = req.body;

    const result = await pool.request()
      .input('MaterialCode', sql.VarChar, scannedCode)
      .query(`SELECT MaterialID, CurrentQuantity FROM Materials WHERE MaterialCode = @MaterialCode`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const { MaterialID, CurrentQuantity } = result.recordset[0];

    if (CurrentQuantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    // Update stock
    await pool.request()
      .input('MaterialID', sql.Int, MaterialID)
      .input('Quantity', sql.Int, quantity)
      .query(`UPDATE Materials SET CurrentQuantity = CurrentQuantity - @Quantity WHERE MaterialID = @MaterialID`);

    // Insert transaction log
    await pool.request()
      .input('MaterialID', sql.Int, MaterialID)
      .input('UserID', sql.Int, userId)
      .input('TransactionType', sql.VarChar, 'CONSUMPTION')
      .input('Quantity', sql.Int, quantity)
      .input('TransactionDate', sql.DateTime, new Date())
      .input('ReferenceDocument', sql.VarChar, referenceDoc || null)
      .input('MachineID', sql.Int, machineId || null)
      .input('DepartmentID', sql.Int, departmentId || null)
      .query(`
        INSERT INTO InventoryTransactions 
        (MaterialID, UserID, TransactionType, Quantity, TransactionDate, ReferenceDocument, MachineID, DepartmentID)
        VALUES 
        (@MaterialID, @UserID, @TransactionType, @Quantity, @TransactionDate, @ReferenceDocument, @MachineID, @DepartmentID)
      `);

    res.status(200).json({ message: 'Consumption recorded successfully' });
  } catch (err) {
    console.error('QR Consumption Error:', err);
    res.status(500).json({ message: 'Error recording consumption' });
  }
};



export const getConsumptionTransactions = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        t.TransactionID,
        t.TransactionType,
        t.Quantity,
        t.TransactionDate,
        t.ReferenceDocument,
        m.MaterialCode,
        m.Description,
        u.Email AS PerformedBy
      FROM dbo.InventoryTransactions t
      JOIN dbo.Materials m ON t.MaterialID = m.MaterialID
      JOIN dbo.Users u ON t.UserID = u.UserID
      WHERE t.TransactionType = 'CONSUMPTION'
      ORDER BY t.TransactionDate DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching consumption transactions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
