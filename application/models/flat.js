module.exports = (sequelize, DataTypes) => {
  const Flat = sequelize.define('Flat', {
    name: DataTypes.STRING,
    paymentDetails: DataTypes.STRING,
  }, {});
  Flat.associate = (models) => {
    Flat.belongsTo(models.User);
    Flat.hasMany(models.Unit);
  };
  return Flat;
};
