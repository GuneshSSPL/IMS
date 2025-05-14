// dashboardController.js
import { pool } from '../config/db.js'; // Ensure correct import path

export const getDashboardStats = async (req, res) => {
  try {
    const request = pool.request(); // Use the pre-connected pool
    const result = await request.query('SELECT * FROM Materials;');
    const materialsData = result.recordset;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="materials.json"');
    res.send(JSON.stringify(materialsData, null, 2));

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch materials' 
    });
  }
};