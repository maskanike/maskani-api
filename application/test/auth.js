/* eslint handle-callback-err: "off"*/
process.env.NODE_ENV = 'test'

const { User, ForgotPassword } = require('../models')
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
const createdID = []
let verification = ''
let verificationForgot = ''
const email = faker.internet.email()
const phone = '0711223344'

chai.use(chaiHttp)

describe('*********** AUTH ***********', () => {
  after(async () => {
    await ForgotPassword.destroy({
      where: {},
      truncate: true
    })
  })

  describe('/GET /', () => {
    it('it should GET home API url', (done) => {
      chai
        .request(app)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })
  })

  describe('/GET /404url', () => {
    it('it should GET 404 url', (done) => {
      chai
        .request(app)
        .get('/404url')
        .end((err, res) => {
          res.should.have.status(404)
          res.body.should.be.an('object')
          done()
        })
    })
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
    it('it should reject wrong credentials', (done) => {
      chai
        .request(app)
        .post('/login')
        .send({ email: 'admin@admin.com', password: '54321' })
        .end((err, res) => {
          res.should.have.status(409)
          done()
        })
    })
  })

  describe('/POST register', () => {
    it('it should POST register', (done) => {
      const user = {
        name: faker.random.word(),
        email,
        password: faker.internet.password(8),
        phone
      }
      chai
        .request(app)
        .post('/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.an('object')
          res.body.should.include.keys('token', 'user')
          createdID.push(res.body.user.id)
          verification = res.body.user.verification
          done()
        })
    })
    it('it should NOT POST a register if email already exists', (done) => {
      const user = {
        name: faker.random.words(),
        email,
        password: faker.internet.password(8),
        phone
      }
      chai
        .request(app)
        .post('/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
  })

  describe('/POST verify', () => {
    it('it should POST verify', (done) => {
      chai
        .request(app)
        .post('/verify')
        .send({
          id: verification
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.include.keys('email', 'verified')
          res.body.verified.should.equal(true)
          done()
        })
    })
  })

  describe('/POST forgot', () => {
    it('it should POST forgot', (done) => {
      chai
        .request(app)
        .post('/forgot')
        .send({
          email
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.include.keys('msg', 'verification')
          verificationForgot = res.body.verification
          done()
        })
    })
  })

  describe('/POST reset', () => {
    it('it should POST reset', (done) => {
      chai
        .request(app)
        .post('/reset')
        .send({
          id: verificationForgot,
          password: '12345'
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('msg').eql('PASSWORD_CHANGED')
          done()
        })
    })
  })

  describe('/GET token', () => {
    it('it should NOT be able to consume the route since no token was sent', (done) => {
      chai
        .request(app)
        .get('/token')
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
    })
    it('it should GET a fresh token', (done) => {
      chai
        .request(app)
        .get('/token')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('token')
          done()
        })
    })
  })

  after(() => {
    createdID.forEach((id) => {
      User.destroy({ where: { id } }, (err) => {
        if (err) {
          console.log(err)
        }
      })
    })
    ForgotPassword.destroy({ where: {} })
  })
})
