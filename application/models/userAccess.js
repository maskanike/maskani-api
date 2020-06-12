module.exports = (sequelize, DataTypes) => {
  const UserAccess = sequelize.define(
    'UserAccess',
    {
      email: DataTypes.STRING,
      ip: DataTypes.STRING,
      browser: DataTypes.STRING,
      country: DataTypes.STRING
    },
    {}
  )
  return UserAccess
}
