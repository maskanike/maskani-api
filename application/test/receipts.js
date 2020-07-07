/* eslint handle-callback-err: "off"*/

process.env.NODE_ENV = 'test'

const { Receipt } = require('../models')
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

describe('*********** RECEIPT ***********', () => {
  after(() => {
    Receipt.destroy({ where: {} })
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
  describe('/POST receipts/', () => {
    it('it should create an receipt', (done) => {
      const data = {
        amount: 2200,
        TenantId: 1,
        InvoiceId: 1
      }
      chai
        .request(app)
        .post('/receipts')
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('amount').eql(data.amount)
          createdID.push(res.body.id)
          done()
        })
    })
  })
  describe('/GET receipt', () => {
    it('it should NOT be able to consume the route since no token was sent', (done) => {
      chai
        .request(app)
        .get('/receipts')
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
    })
    it('it should GET receipts', (done) => {
      chai
        .request(app)
        .get('/receipts')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body[0].should.include.keys('amount')
          done()
        })
    })
    it('it should GET receipts given ID', (done) => {
      chai
        .request(app)
        .get(`/receipts/${createdID[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.include.keys('amount')
          done()
        })
    })
  })
})
