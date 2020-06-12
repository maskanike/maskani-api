module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Invoices', 'UnitId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Units',
        key: 'id'
      }
    }),

  down: (queryInterface) => queryInterface.removeColumn('Invoices', 'UnitId')
}
