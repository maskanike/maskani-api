/* eslint handle-callback-err: "off"*/

process.env.NODE_ENV = 'test'

const { Flat } = require('../models')
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
const name = faker.random.words()
const newName = faker.random.words()
const repeatedName = faker.random.words()

chai.use(chaiHttp)

describe('*********** FLATS ***********', () => {
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

  describe('/GET flats', () => {
    it('it should NOT be able to consume the route since no token was sent', (done) => {
      chai
        .request(app)
        .get('/flats')
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
    })
    it('it should GET all the flats', (done) => {
      chai
        .request(app)
        .get('/flats')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          done()
        })
    })
  })

  describe('/POST flat', () => {
    it('it should NOT POST a flat without name', (done) => {
      const flat = {}
      chai
        .request(app)
        .post('/flats')
        .set('Authorization', `Bearer ${token}`)
        .send(flat)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
    it('it should POST a flat ', (done) => {
      const flat = {
        name
      }
      chai
        .request(app)
        .post('/flats')
        .set('Authorization', `Bearer ${token}`)
        .send(flat)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.include.keys('id', 'name')
          createdID.push(res.body.id)
          done()
        })
    })
    it('it should NOT POST a flat that already exists', (done) => {
      const flat = {
        name
      }
      chai
        .request(app)
        .post('/flats')
        .set('Authorization', `Bearer ${token}`)
        .send(flat)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          done()
        })
    })
    it('it should GET the flats with filters', (done) => {
      chai
        .request(app)
        .get(`/flats?filter=${name}&fields=name`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body.should.have.lengthOf(1)
          res.body[0].should.have.property('name').eql(name)
          done()
        })
    })
  })

  describe('/GET/:id flat', () => {
    it('it should GET a flat by the given id', (done) => {
      const id = createdID.slice(-1).pop()
      chai
        .request(app)
        .get(`/flats/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((error, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('name')
          res.body.should.have.property('id').eql(id)
          done()
        })
    })
  })

  describe('/PATCH/:id flat', () => {
    it('it should UPDATE a flat given the id', (done) => {
      const id = createdID.slice(-1).pop()
      chai
        .request(app)
        .patch(`/flats/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: newName
        })
        .end((error, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('id').eql(id)
          res.body.should.have.property('name').eql(newName)
          done()
        })
    })
    it('it should NOT UPDATE a flat that already exists', (done) => {
      const flat = {
        name: repeatedName
      }
      chai
        .request(app)
        .post('/flats')
        .set('Authorization', `Bearer ${token}`)
        .send(flat)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.include.keys('id', 'name')
          res.body.should.have.property('name').eql(repeatedName)
          createdID.push(res.body.id)
          const anotherFlat = {
            name: newName
          }
          chai
            .request(app)
            .patch(`/flats/${createdID.slice(-1).pop()}`)
            .set('Authorization', `Bearer ${token}`)
            .send(anotherFlat)
            .end((error, result) => {
              result.should.have.status(422)
              result.body.should.be.a('object')
              result.body.should.have.property('errors')
              done()
            })
        })
    })
  })

  describe('/DELETE/:id flat', () => {
    it('it should DELETE a flat given the id', (done) => {
      const flat = {
        name
      }
      chai
        .request(app)
        .post('/flats')
        .set('Authorization', `Bearer ${token}`)
        .send(flat)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.include.keys('id', 'name')
          res.body.should.have.property('name').eql(name)
          chai
            .request(app)
            .delete(`/flats/${res.body.id}`)
            .set('Authorization', `Bearer ${token}`)
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
      Flat.destroy({ where: { id } }, (err) => {
        if (err) {
          console.log(err)
        }
      })
    })
  })
})
