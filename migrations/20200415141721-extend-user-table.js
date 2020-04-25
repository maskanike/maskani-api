
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Users', 'verification', { type: Sequelize.STRING }, { transaction });
      await queryInterface.addColumn('Users', 'verified', { type: Sequelize.BOOLEAN, defaultValue: true }, { transaction });
      await queryInterface.addColumn('Users', 'loginAttempts', { type: Sequelize.INTEGER, defaultValue: 0 }, { transaction });
      await queryInterface.addColumn('Users', 'blockExpires', { type: Sequelize.DATE, defaultValueValue: Sequelize.NOW }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Users', 'verification', { transaction });
      await queryInterface.removeColumn('Users', 'verified', { transaction });
      await queryInterface.removeColumn('Users', 'loginAttempts', { transaction });
      await queryInterface.removeColumn('Users', 'blockExpires', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
