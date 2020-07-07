const uuid = require('uuid')
const { User } = require('../models')

module.exports = {
  up: async () => {
    const password = '12345'
    return User.bulkCreate([
      {
        email: 'admin@admin.com',
        msisdn: '254723453841',
        password,
        role: 'admin',
        name: 'Samuel Magondu',
        status: 'active',
        verification: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user@user.com',
        msisdn: '254713849874',
        password,
        role: 'user',
        name: 'Magondu Njenga',
        status: 'active',
        verification: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  down: (queryInterface) => queryInterface.bulkDelete('Users', null, {})
}
