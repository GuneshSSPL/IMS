import { sql, pool, poolConnect } from '../config/db.js';

export const getAllRoles = async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request().query('SELECT * FROM Roles');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).send('Server error');
  }
};
