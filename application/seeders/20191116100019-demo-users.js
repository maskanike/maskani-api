const uuid = require('uuid')

module.exports = {
  up: async (queryInterface) => {
    const password = '12345678'
    return queryInterface.bulkInsert('Users', [
      {
        id: 1,
        email: 'samuel@flatspad.com',
        phone: '254723453841',
        password,
        name: 'Samuel Magondu',
        status: 'active',
        role: 'landlord',
        verification: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        email: 'magondunjenga@gmail.com',
        phone: '254713849874',
        password,
        name: 'Magondu Njenga',
        status: 'active',
        role: 'tenant',
        verification: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        email: 'eugenenyawara@gmail.com',
        phone: '254725902510',
        password,
        name: 'Eugene Nyawara',
        status: 'active',
        role: 'tenant',
        verification: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        email: 'magonduback@gmail.com',
        phone: '254723453841',
        password,
        name: 'Magondu Back',
        status: 'active',
        role: 'tenant',
        verification: uuid.v4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  down: (queryInterface) => queryInterface.bulkDelete('Users', null, {})
}
