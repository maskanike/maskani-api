module.exports = (sequelize, DataTypes) => {
  const Reminder = sequelize.define('Reminder', {
    message: DataTypes.STRING,
  }, {});
  Reminder.associate = (models) => {
    Reminder.belongsTo(models.Invoice);
  };
  return Reminder;
};
