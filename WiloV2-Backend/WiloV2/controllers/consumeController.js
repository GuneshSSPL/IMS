import { pool, sql } from '../config/db.js';

export const consumeMaterial = async (req, res) => {
  try {
    const { materialCode, quantity } = req.body;
    const userId = 1; 
    const materialResult = await pool.request()
      .input('MaterialCode', sql.NVarChar, materialCode)
      .query('SELECT * FROM dbo.Materials WHERE MaterialCode = @MaterialCode');

    if (materialResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const material = materialResult.recordset[0];

    // Check available quantity
    if (material.CurrentQuantity < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock' });
    }

    // Calculate new quantity
    const newQuantity = material.CurrentQuantity - quantity;

    // Update material quantity
    await pool.request()
      .input('NewQuantity', sql.Decimal(9, 2), newQuantity)
      .input('MaterialCode', sql.NVarChar, material.MaterialCode)
      .query('UPDATE dbo.Materials SET CurrentQuantity = @NewQuantity WHERE MaterialCode = @MaterialCode');

    // Create transaction record
    await pool.request()
      .input('MaterialCode', sql.NVarChar, material.MaterialCode)
      .input('UserID', sql.Int, userId)
      .input('TransactionType', sql.NVarChar, 'CONSUMPTION')
      .input('Quantity', sql.Int, quantity)
      .input('TransactionDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO dbo.InventoryTransactions 
        (MaterialCode, UserID, TransactionType, Quantity, TransactionDate)
        VALUES (@MaterialCode, @UserID, @TransactionType, @Quantity, @TransactionDate)
      `); 

    return res.status(200).json({
      success: true,
      message: 'Material consumed successfully',
      data: {
        materialCode: material.MaterialCode,
        oldQuantity: material.CurrentQuantity,
        consumed: quantity,
        newQuantity
      }
    });
  } catch (error) {
    console.error('Error consuming material:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMaterialByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.request()
      .input('MaterialCode', sql.NVarChar, code)
      .query('SELECT * FROM dbo.Materials WHERE MaterialCode = @MaterialCode');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllMaterials = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT [MaterialCode] 
      FROM [WilloV2].[dbo].[Materials]
    `);
    
    res.json({ 
      success: true,
      data: result.recordset 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching material codes: ' + err.message 
    });
  }
};