// /import { DataTypes } from 'sequelize';
// import sequelize from '../config/database.js';

const Supplier = sequelize.define('Supplier', {
  SupplierID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  SupplierName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ContactDetails: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'Suppliers',
  timestamps: false
});

export default Supplier;