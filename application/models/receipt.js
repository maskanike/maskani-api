module.exports = (sequelize, DataTypes) => {
  const Receipt = sequelize.define(
    'Receipt',
    {
      amount: DataTypes.INTEGER,
      outdated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {}
  )
  Receipt.associate = (models) => {
    Receipt.belongsTo(models.Tenant)
    Receipt.belongsTo(models.Invoice)
  }
  return Receipt
}
