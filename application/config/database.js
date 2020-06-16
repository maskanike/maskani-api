require('dotenv').config()

const pgDbObject = {
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: '127.0.0.1',
  port: '5432',
  dialect: 'postgres',
  logging: console.log
}

module.exports = {
  development: { ...pgDbObject },
  test: { ...pgDbObject, database: process.env.TEST_DB_NAME }
}
