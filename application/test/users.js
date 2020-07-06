/* eslint handle-callback-err: "off"*/

process.env.NODE_ENV = 'test'

const { User } = require('../models')

const faker = require('faker')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
// eslint-disable-next-line no-unused-vars
const should = chai.should()
const loginDetails = {
  admin: {
    email: 'admin@admin.com',
    password: '12345'
  },
  user: {
    email: 'user@user.com',
    password: '12345'
  }
}
const tokens = {
  admin: '',
  user: ''
}

const email = faker.internet.email()
const createdID = []

chai.use(chaiHttp)

describe('*********** USERS ***********', () => {
  describe('/POST login', () => {
    it('it should GET token as admin', (done) => {
      chai
        .request(app)
        .post('/login')
        .send(loginDetails.admin)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('token')
          tokens.admin = res.body.token
          done()
        })
    })
    it('it should GET token as user', (done) => {
      chai
        .request(app)
        .post('/login')
        .send(loginDetails.user)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('token')
          tokens.user = res.body.token
          done()
        })
    })
  })
  describe('/GET users', () => {
    it('it should NOT be able to consume the route since no token was sent', (done) => {
      chai
        .request(app)
        .get('/users')
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
    })
    it('it should GET all the users', (done) => {
      chai
        .request(app)
        .get('/users')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          done()
        })
    })
    it('it should GET the users with filters', (done) => {
      chai
        .request(app)
        .get('/users?filter=admin&fields=name,email,phone')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body.should.have.lengthOf(1)
          res.body[0].should.have.property('email').eql('admin@admin.com')
          done()
        })
    })
  })
  describe('/POST user', () => {
    it('it should NOT POST a user without name', (done) => {
      const user = {}
      chai
        .request(app)
        .post('/users')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
    it('it should POST a user ', (done) => {
      const user = {
        name: faker.random.words(),
        email,
        password: faker.random.words(),
        role: 'admin',
        phone: faker.phone.phoneNumber()
      }
      chai
        .request(app)
        .post('/users')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.include.keys('id', 'name', 'email', 'verification')
          createdID.push(res.body.id)
          done()
        })
    })
    it('it should NOT POST a user with email that already exists', (done) => {
      const user = {
        name: faker.random.words(),
        email,
        password: faker.random.words(),
        role: 'admin'
      }
      chai
        .request(app)
        .post('/users')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
    it('it should NOT POST a user with not known role', (done) => {
      const user = {
        name: faker.random.words(),
        email,
        password: faker.random.words(),
        role: faker.random.words()
      }
      chai
        .request(app)
        .post('/users')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
  })
  describe('/GET/:id user', () => {
    it('it should GET a user by the given id', (done) => {
      const id = createdID.slice(-1).pop()

      chai
        .request(app)
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .end((error, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('name')
          res.body.should.have.property('id').eql(id)
          done()
        })
    })
  })
  describe('/PATCH/:id user', () => {
    it('it should UPDATE a user given the id', (done) => {
      const id = createdID.slice(-1).pop()
      const user = {
        name: 'JS123456',
        email: 'emailthatalreadyexists@email.com',
        role: 'admin',
        phone: faker.phone.phoneNumber()
      }
      chai
        .request(app)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(user)
        .end((error, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('id').eql(id)
          res.body.should.have.property('name').eql('JS123456')
          res.body.should.have
            .property('email')
            .eql('emailthatalreadyexists@email.com')
          createdID.push(res.body.id)
          done()
        })
    })
    it('it should NOT UPDATE a user with email that already exists', (done) => {
      const id = createdID.slice(-1).pop()
      const user = {
        name: faker.random.words(),
        email: 'admin@admin.com',
        role: 'admin'
      }
      chai
        .request(app)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
    it('it should NOT UPDATE another user if not an admin', (done) => {
      const id = createdID.slice(-1).pop()
      const user = {
        name: faker.random.words(),
        email: 'toto@toto.com',
        role: 'user'
      }
      chai
        .request(app)
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${tokens.user}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
  })
  describe('/DELETE/:id user', () => {
    it('it should DELETE a user given the id', (done) => {
      const user = {
        name: faker.random.words(),
        email: faker.internet.email(),
        password: faker.random.words(),
        role: 'admin',
        phone: faker.phone.phoneNumber()
      }
      chai
        .request(app)
        .post('/users')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.include.keys('id', 'name', 'email', 'verification')
          chai
            .request(app)
            .delete(`/users/${res.body.id}`)
            .set('Authorization', `Bearer ${tokens.admin}`)
            .end((error, result) => {
              result.should.have.status(200)
              result.body.should.be.a('object')
              result.body.should.have.property('msg').eql('DELETED')
              done()
            })
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
  })
})
