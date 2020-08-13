/* eslint handle-callback-err: "off"*/

process.env.NODE_ENV = 'test'

const { Reminder } = require('../models')
const faker = require('faker')
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
let UnitId = ''
const createdID = []

chai.use(chaiHttp)

describe('*********** TENANTS ***********', () => {
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

  describe('/POST unit', () => {
    it('it should create a new unit', (done) => {
      const data = {
        name: 'test unit'
      }
      chai
        .request(app)
        .post('/units')
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.an('object')
          res.body.should.have.property('id')
          res.body.should.have.property('name')
          UnitId = res.body.id
          done()
        })
    })
  })
  describe('/POST tenants/', () => {
    it('it should create a tenant', (done) => {
      const data = {
        name: 'tenant A',
        phone: '0123456',
        email: faker.internet.email(),
        rent: 2000,
        penalty: 100,
        garbage: 100,
        water: 100,
        UnitId
      }
      chai
        .request(app)
        .post('/tenants')
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('rent').eql(data.rent)
          res.body.should.have.property('email').eql(data.email)
          res.body.should.have.property('water').eql(data.water)
          createdID.push(res.body.id)
          done()
        })
    })
  })
  describe('/GET tenant', () => {
    it('it should NOT be able to consume the route since no token was sent', (done) => {
      chai
        .request(app)
        .get('/tenants')
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
    })
    it('it should GET tenant', (done) => {
      chai
        .request(app)
        .get('/tenants')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body[0].should.include.keys('email', 'rent', 'water')
          done()
        })
    })
    it('it should GET tenant given ID', (done) => {
      chai
        .request(app)
        .get(`/tenants/${createdID[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.include.keys('email', 'rent', 'water')
          done()
        })
    })
  })
  describe('PATCH tenant', () => {
    it('it should update a tenant', (done) => {
      const data = {
        name: 'updated tenant',
        phone: '6543210',
        email: faker.internet.email(),
        rent: 3000,
        penalty: 150,
        garbage: 150,
        water: 150,
        UnitId
      }
      chai
        .request(app)
        .patch(`/tenants/${createdID[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('name').eql(data.name)
          res.body.should.have.property('rent').eql(data.rent)
          done()
        })
    })
    it('it should mark a tenant as moved out', (done) => {
      const data = {
        id: createdID[0]
      }
      chai
        .request(app)
        .patch('/tenants/movedout')
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('status').eql('left')

          chai
            .request(app)
            .get(`/units/${UnitId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err2, res2) => {
              res2.should.have.status(200)
              res2.body.should.be.a('object')
              res2.body.should.have.property('TenantId').eql(null)
              done()
            })
        })
    })
  })
})
