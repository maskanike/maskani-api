module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.changeColumn(
        'Users',
        'role',
        { type: Sequelize.STRING },
        { transaction }
      )
      await queryInterface.sequelize.query(
        queryInterface.queryGenerator.pgEnumDrop('Users', 'role'),
        { transaction }
      )

      await queryInterface.changeColumn(
        'Users',
        'role',
        {
          type: Sequelize.ENUM,
          values: ['admin', 'user']
        },
        { transaction }
      )

      await queryInterface.addColumn(
        'Users',
        'userType',
        {
          type: Sequelize.ENUM,
          values: ['landlord', 'agent', 'tenant']
        },
        { transaction }
      )

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.changeColumn(
        'Users',
        'role',
        { type: Sequelize.STRING },
        { transaction }
      )
      await queryInterface.sequelize.query(
        queryInterface.queryGenerator.pgEnumDrop('Users', 'role'),
        { transaction }
      )
      await queryInterface.changeColumn(
        'Users',
        'role',
        {
          type: Sequelize.ENUM,
          values: ['landlord', 'agent', 'tenant']
        },
        { transaction }
      )

      await queryInterface.removeColumn('Users', 'userType', { transaction })
      await queryInterface.sequelize.query(
        queryInterface.queryGenerator.pgEnumDrop('Users', 'userType'),
        { transaction }
      )

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }
}
