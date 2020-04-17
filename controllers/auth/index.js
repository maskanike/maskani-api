const { matchedData } = require('express-validator')
const auth = require('../../middleware/auth')
const emailer = require('../../middleware/emailer')
const utils = require('../../middleware/utils')
const uuid = require('uuid')
const jwt = require('jsonwebtoken')

/**
 * Generates a token
 * @param {Object} user - user object
 */
const generateToken = (user) => {
    // Gets expiration time
    const expiration =
      Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES
  
    // returns signed and encrypted token
    return auth.encrypt(
      jwt.sign(
        {
          data: {
            id: user
          },
          exp: expiration
        },
        process.env.JWT_SECRET
      )
    )
  }

/**
 * Creates an object with user info
 * @param {Object} req - request object
 */
const setUserInfo = (req) => {
    let user = {
      _id: req._id,
      name: req.name,
      email: req.email,
      role: req.role,
      verified: req.verified
    }
    // Adds verification for testing purposes
    if (process.env.NODE_ENV !== 'production') {
      user = {
        ...user,
        verification: req.verification
      }
    }
    return user
  }

/**
 * Registers a new user in database
 * @param {Object} req - request object
 */
const registerUser = async (req) => {
    return new Promise((resolve, reject) => {
        // TODO use sequelize for this query
      const user = new User({
        name: req.name,
        email: req.email,
        password: req.password,
        verification: uuid.v4()
      })
      user.save((err, item) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }
        resolve(item)
      })
    })
  }


/**
 * Builds the registration token
 * @param {Object} item - user object that contains created id
 * @param {Object} userInfo - user object
 */
const returnRegisterToken = (item, userInfo) => {
    if (process.env.NODE_ENV !== 'production') {
      userInfo.verification = item.verification
    }
    const data = {
      token: generateToken(item._id),
      user: userInfo
    }
    return data
  }  

/**
 * Register function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.register = async (req, res) => {
    try {
      req = matchedData(req)
      const doesEmailExists = await emailer.emailExists(req.email)
      if (!doesEmailExists) {
        const item = await registerUser(req)
        const userInfo = setUserInfo(item)
        const response = returnRegisterToken(item, userInfo)
        emailer.sendRegistrationEmailMessage(locale, item)
        res.status(201).json(response)
      }
    } catch (error) {
      utils.handleError(res, error)
    }
  }