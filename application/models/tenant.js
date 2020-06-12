module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, isEmail: true, isLowercase: true, notNull: true },
    phone: { type: DataTypes.STRING, field: 'msisdn' },
    rent: DataTypes.INTEGER,
    deposit: DataTypes.INTEGER,
    balance: DataTypes.INTEGER,
    water: DataTypes.INTEGER,
    garbage: DataTypes.INTEGER,
    penalty: DataTypes.INTEGER,
    receiptAmount: DataTypes.INTEGER,
    status: DataTypes.ENUM('unchanged', 'changed', 'left'), // occupancy status
    paymentStatus: DataTypes.ENUM('fully_paid', 'has_dues', 'defaulted'), // payment status
    lastPaymentMadeAt: DataTypes.DATE,
    lastInvoiceSentAt: DataTypes.DATE,
    lastReceiptSentAt: DataTypes.DATE,
    lastInvoiceSentId: DataTypes.INTEGER,
    unitName: DataTypes.STRING, // To make data fetching easier
    flatName: DataTypes.STRING, // To make data fetching easier

  }, {});
  Tenant.associate = (models) => {
    Tenant.belongsTo(models.Flat);
    Tenant.hasOne(models.Statement);
    Tenant.hasOne(models.Unit);
    Tenant.hasMany(models.Receipt);
    Tenant.hasMany(models.Invoice);
  };
  return Tenant;
};
