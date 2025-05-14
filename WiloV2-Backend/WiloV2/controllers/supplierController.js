import { sql, pool, poolConnect } from '../config/db.js';

export const getAllSuppliers = async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request().query('SELECT * FROM Suppliers');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).send('Server error');
  }
};


export const createSupplier = async (req, res) => {
    const { SupplierName, ContactDetails } = req.body;
  
    if (!SupplierName) return res.status(400).send('SupplierName is required');
  
    await poolConnect;
    try {
      const result = await pool.request()
        .input('SupplierName', sql.VarChar, SupplierName)
        .input('ContactDetails', sql.VarChar, ContactDetails || null)
        .query('INSERT INTO Suppliers (SupplierName, ContactDetails) VALUES (@SupplierName, @ContactDetails)');
      res.status(201).send('Supplier created');
    } catch (err) {
      console.error('Error creating supplier:', err);
      res.status(500).send('Server error');
    }
  };
  