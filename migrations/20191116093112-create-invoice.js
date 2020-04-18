
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Invoices', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    rent: {
      type: Sequelize.INTEGER,
    },
    water: {
      type: Sequelize.INTEGER,
    },
    garbage: {
      type: Sequelize.INTEGER,
    },
    penalty: {
      type: Sequelize.INTEGER,
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
  down: (queryInterface) => queryInterface.dropTable('Invoices'),
};
