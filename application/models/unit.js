module.exports = (sequelize, DataTypes) => {
  const Unit = sequelize.define('Unit', {
    name: DataTypes.STRING,
    status: DataTypes.ENUM('active', 'pending', 'deleted'),
  }, {});
  Unit.associate = (models) => {
    Unit.belongsTo(models.Flat);
    Unit.belongsTo(models.Tenant);
    Unit.hasMany(models.Invoice);
  };
  return Unit;
};
