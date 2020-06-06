
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Reminders', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    reminder: {
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    InvoiceId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Invoices',
        key: 'id',
      },
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('Receipts'),
};

