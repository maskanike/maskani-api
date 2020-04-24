var bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    msisdn: DataTypes.STRING,
    password: { 
      type: DataTypes.STRING, 
      allowNull: false
    },
    status: DataTypes.ENUM('active', 'pending', 'deleted'),
    role: { type: DataTypes.ENUM('admin', 'user'), default: 'user' },
    userType: DataTypes.ENUM('landlord', 'agent', 'tenant'),
    verification: DataTypes.STRING,
    verified: { type: DataTypes.BOOLEAN, default: false },
    loginAttempts: { type: DataTypes.INTEGER, default: 0 },
    blockExpires: { type: DataTypes.DATE, default: sequelize.NOW },
  }, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    },
  });
  User.prototype.comparePassword = function(password, cb) {
    return bcrypt.compare(password, this.password, (err, isMatch) =>
    err ? cb(err) : cb(null, isMatch)
    )
  }
  return User;
};
