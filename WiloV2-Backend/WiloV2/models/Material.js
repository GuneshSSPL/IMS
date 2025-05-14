// models/Material.js (example)
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js'; // Your sequelize instance

const Material = sequelize.define('Material', {
  mutualCode:   { type: DataTypes.STRING },
  issCode:      { type: DataTypes.STRING },
  description:  { type: DataTypes.STRING },
  category:     { type: DataTypes.STRING },
  mainFeatures: { type: DataTypes.STRING },
  supplier:     { type: DataTypes.STRING },
  uom:          { type: DataTypes.STRING },
  umlPase:      { type: DataTypes.FLOAT },
  quantity:     { type: DataTypes.INTEGER },
  totalPase:    { type: DataTypes.FLOAT },
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date:         { type: DataTypes.DATE },
  toDate:       { type: DataTypes.DATE },
  results:      { type: DataTypes.STRING }
}, {
  tableName: 'Materials',
  timestamps: false
});

export default Material;
