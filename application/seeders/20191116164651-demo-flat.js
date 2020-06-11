module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Flats', [{
    id: 1,
    name: 'Watercress Woods',
    paymentDetails: '00001000010000',
    UserId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {}),

  down: (queryInterface) => queryInterface.bulkDelete('Flats', null, {}),
};
