module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    rent: DataTypes.INTEGER,
    water: DataTypes.INTEGER,
    garbage: DataTypes.INTEGER,
    penalty: DataTypes.INTEGER,
    outdated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, {});
  Invoice.associate = (models) => {
    Invoice.belongsTo(models.Tenant);
    Invoice.belongsTo(models.Unit);
  };
  return Invoice;
};
