module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    rent: DataTypes.INTEGER,
    deposit: DataTypes.INTEGER,
    balance: DataTypes.INTEGER,
    water: DataTypes.INTEGER,
    garbage: DataTypes.INTEGER,
    penalty: DataTypes.INTEGER,
    receiptAmount: DataTypes.INTEGER,
    status: DataTypes.ENUM('unchanged', 'changed', 'left'),
  }, {});
  Tenant.associate = (models) => {
    Tenant.belongsTo(models.Flat);
    Tenant.belongsTo(models.User);
    Tenant.hasOne(models.Statement);
    Tenant.hasOne(models.Unit);
    Tenant.hasMany(models.Receipt);
    Tenant.hasMany(models.Invoice);
  };
  return Tenant;
};
