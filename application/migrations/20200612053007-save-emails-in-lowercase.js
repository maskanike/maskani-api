module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('Users', 'email', { type: Sequelize.STRING, isEmail: true, isLowercase: true, notNull: true }, { transaction });
      await queryInterface.changeColumn('Tenants', 'email', { type: Sequelize.STRING, isEmail: true, isLowercase: true, notNull: true }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('Users', 'email', { type: Sequelize.STRING }, { transaction });
      await queryInterface.changeColumn('Tenants', 'email', { type: Sequelize.STRING }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
