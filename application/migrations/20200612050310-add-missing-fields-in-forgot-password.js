module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.changeColumn(
        'ForgotPasswords',
        'email',
        {
          type: Sequelize.STRING,
          isEmail: true,
          isLowercase: true,
          notNull: true
        },
        { transaction }
      )
      await queryInterface.addColumn(
        'ForgotPasswords',
        'used',
        { type: Sequelize.BOOLEAN, defaultValue: false },
        { transaction }
      )
      await queryInterface.addColumn(
        'ForgotPasswords',
        'ipChanged',
        { type: Sequelize.STRING },
        { transaction }
      )
      await queryInterface.addColumn(
        'ForgotPasswords',
        'browserChanged',
        { type: Sequelize.STRING },
        { transaction }
      )
      await queryInterface.addColumn(
        'ForgotPasswords',
        'countryChanged',
        { type: Sequelize.STRING },
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
        'ForgotPasswords',
        'email',
        { type: Sequelize.STRING },
        { transaction }
      )
      await queryInterface.removeColumn('ForgotPasswords', 'used', {
        transaction
      })
      await queryInterface.removeColumn('ForgotPasswords', 'ipChanged', {
        transaction
      })
      await queryInterface.removeColumn('ForgotPasswords', 'browserChanged', {
        transaction
      })
      await queryInterface.removeColumn('ForgotPasswords', 'countryChanged', {
        transaction
      })
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }
}
