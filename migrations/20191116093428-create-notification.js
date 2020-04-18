
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Notifications', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    message: {
      type: Sequelize.JSON,
    },
    destination: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.ENUM('email', 'sms'),
    },
    status: {
      type: Sequelize.ENUM('success', 'failed'),
    },
    error: {
      type: Sequelize.JSON,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    TenantId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Tenants',
        key: 'id',
      },
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('Notifications'),
};
