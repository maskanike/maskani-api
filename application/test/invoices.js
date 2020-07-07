/* eslint handle-callback-err: "off"*/

process.env.NODE_ENV = 'test'

const { Reminder } = require('../models')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
// eslint-disable-next-line no-unused-vars
const should = chai.should()
const loginDetails = {
  email: 'admin@admin.com',
  password: '12345'
}
let token = ''
const createdID = []

chai.use(chaiHttp)

describe('*********** INVOICE ***********', () => {
  after(() => {
    Reminder.destroy({ where: {} })
  })

  describe('/POST login', () => {
    it('it should GET token', (done) => {
      chai
        .request(app)
        .post('/login')
        .send(loginDetails)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('token')
          token = res.body.token
          done()
        })
    })
  })
  describe('/POST invoices/', () => {
    it('it should create an invoice', (done) => {
      const data = {
        rent: 2000,
        penalty: 100,
        garbage: 150,
        water: 200,
        TenantId: 1,
        UnitId: 1,
        dueDate: '2020-09-10'
      }
      chai
        .request(app)
        .post('/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('rent').eql(data.rent)
          res.body.should.have.property('water').eql(data.water)
          createdID.push(res.body.id)
          done()
        })
    })
    it('it should create a reminder for invoice', (done) => {
      const data = {
        message: 'please pay',
        InvoiceId: createdID[0]
      }
      chai
        .request(app)
        .post('/invoices/reminder')
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('message').eql(data.message)
          createdID.push(res.body.id)
          done()
        })
    })
  })
  describe('/GET invoice', () => {
    it('it should NOT be able to consume the route since no token was sent', (done) => {
      chai
        .request(app)
        .get('/invoices')
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
    })
    it('it should GET invoice', (done) => {
      chai
        .request(app)
        .get('/invoices')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body[0].should.include.keys('rent', 'water')
          done()
        })
    })
    it('it should GET invoice given ID', (done) => {
      chai
        .request(app)
        .get(`/invoices/${createdID[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.include.keys('rent', 'water')
          done()
        })
    })
  })
})
