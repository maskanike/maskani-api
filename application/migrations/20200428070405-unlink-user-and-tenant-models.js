module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn(
        'Tenants',
        'name',
        { type: Sequelize.STRING },
        { transaction }
      )
      await queryInterface.addColumn(
        'Tenants',
        'email',
        { type: Sequelize.STRING },
        { transaction }
      )
      await queryInterface.addColumn(
        'Tenants',
        'msisdn',
        { type: Sequelize.STRING },
        { transaction }
      )
      await queryInterface.removeColumn('Tenants', 'UserId', { transaction })
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.removeColumn('Tenants', 'name', { transaction })
      await queryInterface.removeColumn('Tenants', 'email', { transaction })
      await queryInterface.removeColumn('Tenants', 'msisdn', { transaction })
      await queryInterface.addColumn(
        'Tenants',
        'UserId',
        { type: Sequelize.INTEGER },
        { transaction }
      )
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }
}
