module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Tenants', 'receiptAmount', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }),

  down: (queryInterface) =>
    queryInterface.removeColumn('Tenants', 'receiptAmount')
}
