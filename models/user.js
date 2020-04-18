module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    msisdn: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.ENUM('active', 'pending', 'deleted'),
    role: DataTypes.ENUM('landlord', 'agent', 'tenant'),
    verification: DataTypes.STRING,
    verified: { type: DataTypes.BOOLEAN, default: false },
    loginAttempts: { type: DataTypes.INTEGER, default: 0 },
    blockExpires: { type: DataTypes.DATE, default: sequelize.NOW },
  }, {});
  return User;
};

// TODO generate hash for password here.
// compare passwords here
