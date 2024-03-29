const { matchedData } = require('express-validator')
const { User, UserAccess, ForgotPassword } = require('../../models')
const auth = require('../../middleware/auth')
const emailer = require('../../middleware/emailer')
const utils = require('../../middleware/utils')
const uuid = require('uuid')
const { addHours } = require('date-fns')
const jwt = require('jsonwebtoken')

const HOURS_TO_BLOCK = 2
const LOGIN_ATTEMPTS = 5

/*********************
 * Private functions *
 *********************/

/**
 * Creates an object with user info
 * @param {Object} req - request object
 */
const setUserInfo = (req) => {
  let user = {
    id: req.id,
    name: req.name,
    email: req.email,
    phone: req.phone,
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
 * Saves a new user access and then returns token
 * @param {Object} req - request object
 * @param {Object} user - user object
 */
const saveUserAccessAndReturnToken = async (req, user) => {
  return new Promise((resolve, reject) => {
    const userAccess = {
      email: user.email,
      ip: utils.getIP(req),
      browser: utils.getBrowserInfo(req),
      country: utils.getCountry(req)
    }
    UserAccess.create(userAccess)
      .then(() => {
        const userInfo = setUserInfo(user)
        // Returns data with access token
        resolve({
          token: generateToken(user.id),
          user: userInfo
        })
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Blocks a user by setting blockExpires to the specified date based on constant HOURS_TO_BLOCK
 * @param {number} id - user's id
 */
const blockUser = async (id) => {
  return new Promise((resolve, reject) => {
    const blockExpires = addHours(new Date(), HOURS_TO_BLOCK)
    User.update({ blockExpires }, { where: { id } })
      .then((user) => {
        if (user) {
          resolve(utils.buildErrObject(409, 'BLOCKED_USER'))
        }
        reject(utils.buildErrObject(422, 'USER_TO_BLOCK_NOT_FOUND'))
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Saves login attempts to dabatabse
 * @param {Object} user - user object
 */
const saveLoginAttemptsToDB = async (user) => {
  return new Promise((resolve, reject) => {
    const { loginAttempts, id } = user
    User.update({ loginAttempts }, { where: { id } })
      .then(() => {
        resolve(true)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Checks that login attempts are greater than specified in constant and also that blockexpires is less than now
 * @param {Object} user - user object
 */
const blockIsExpired = (user) =>
  user.loginAttempts > LOGIN_ATTEMPTS && user.blockExpires <= new Date()

/**
 *
 * @param {Object} user - user object.
 */
const checkLoginAttemptsAndBlockExpires = async (user) => {
  return new Promise((resolve, reject) => {
    // Let user try to login again after blockexpires, resets user loginAttempts
    if (blockIsExpired(user)) {
      user.loginAttempts = 0 // update in memory object
      User.update({ loginAttempts: 0 }, { where: { id: user.id } })
        .then((result) => {
          if (result) {
            resolve(true)
          }
        })
        .catch((err) => {
          reject(utils.buildErrObject(422, err.message))
        })
    } else {
      // User is not blocked, check password (normal behaviour)
      resolve(true)
    }
  })
}

/**
 * Checks if blockExpires from user is greater than now
 * @param {Object} user - user object
 */
const userIsBlocked = async (user) => {
  return new Promise((resolve, reject) => {
    if (user.blockExpires > new Date()) {
      reject(utils.buildErrObject(409, 'BLOCKED_USER'))
    }
    resolve(true)
  })
}

/**
 * Finds user by email
 * @param {string} email - user´s email
 */
const findUser = async (email) => {
  return new Promise((resolve, reject) => {
    User.findOne({
      where: { email }, // TODO all emails should be lowercase. Undo after validating this for all input
      attributes: [
        'password',
        'loginAttempts',
        'blockExpires',
        'name',
        'email',
        'role',
        'verified',
        'verification',
        'id'
      ]
    })
      .then((user) => {
        if (!user) {
          reject(utils.buildErrObject(422, 'USER_DOES_NOT_EXIST'))
        }
        resolve(user)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Finds user by ID
 * @param {number} id - user´s id
 */
const findUserById = async (userId) => {
  return new Promise((resolve, reject) => {
    User.findByPk(userId)
      .then((user) => {
        if (!user) {
          reject(utils.buildErrObject(422, 'USER_DOES_NOT_EXIST'))
        }
        resolve(user)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Adds one attempt to loginAttempts, then compares loginAttempts with the constant LOGIN_ATTEMPTS, if is less returns wrong password, else returns blockUser function
 * @param {Object} user - user object
 */
const passwordsDoNotMatch = async (user) => {
  user.loginAttempts += 1
  await saveLoginAttemptsToDB(user)
  return new Promise((resolve, reject) => {
    if (user.loginAttempts <= LOGIN_ATTEMPTS) {
      resolve(utils.buildErrObject(409, 'WRONG_PASSWORD'))
    } else {
      resolve(blockUser(user.id))
    }
    reject(utils.buildErrObject(422, 'ERROR'))
  })
}

/**
 * Checks if verification id exists for user
 * @param {string} id - verification id
 */
const verificationExists = async (id) => {
  return new Promise((resolve, reject) => {
    User.findOne({
      where: {
        verification: id,
        verified: false
      }
    })
      .then((user) => {
        if (!user) {
          reject(utils.buildErrObject(422, 'NOT_FOUND_OR_ALREADY_VERIFIED'))
        }
        resolve(user)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Verifies an user
 * @param {Object} user - user object
 */
const verifyUser = async (user) => {
  return new Promise((resolve, reject) => {
    User.update(
      { verified: true },
      { where: { id: user.id }, returning: true, plain: true }
    )
      .then((item) => {
        resolve({
          email: item[1].dataValues.email,
          verified: item[1].dataValues.verified
        })
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Marks a request to reset password as used
 * @param {Object} req - request object
 * @param {Object} forgot - forgot object
 */
const markResetPasswordAsUsed = async (req, forgot) => {
  return new Promise((resolve, reject) => {
    ForgotPassword.update(
      {
        used: true,
        ipChanged: utils.getIP(req),
        browserChanged: utils.getBrowserInfo(req),
        countryChanged: utils.getCountry(req)
      },
      {
        where: { id: forgot.id }
      }
    )
      .then((item) => {
        if (!item) {
          reject(utils.buildErrObject(422, 'NOT_FOUND'))
        }
        resolve(utils.buildSuccObject('PASSWORD_CHANGED'))
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Updates a user password in database
 * @param {string} password - new password
 * @param {Object} user - user object
 */
const updatePassword = async (password, user) => {
  return new Promise((resolve, reject) => {
    User.findByPk(user.id)
      .then((item) => {
        if (!item) {
          reject(utils.buildErrObject(422, 'NOT_FOUND'))
        }
        item.password = password
        item.save()
        resolve(item)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Finds user by email to reset password
 * @param {string} email - user email
 */
const findUserToResetPassword = async (email) => {
  return new Promise((resolve, reject) => {
    User.findOne({ where: { email } })
      .then((user) => {
        if (!user) {
          reject(utils.buildErrObject(422, 'NOT_FOUND'))
        }
        resolve(user)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Checks if a forgot password verification exists
 * @param {string} id - verification id
 */
const findForgotPassword = async (id) => {
  return new Promise((resolve, reject) => {
    ForgotPassword.findOne({ where: { verification: id, used: false } })
      .then((item) => {
        if (!item) {
          reject(utils.buildErrObject(422, 'NOT_FOUND_OR_ALREADY_USED'))
        }
        resolve(item)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Creates a new password forgot
 * @param {Object} req - request object
 */
const saveForgotPassword = async (req) => {
  return new Promise((resolve, reject) => {
    const forgot = {
      email: req.body.email,
      verification: uuid.v4(),
      ipRequest: utils.getIP(req),
      browserRequest: utils.getBrowserInfo(req),
      countryRequest: utils.getCountry(req)
    }
    ForgotPassword.create(forgot)
      .then((item) => {
        resolve(item)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Builds an object with created forgot password object, if env is development or testing exposes the verification
 * @param {Object} item - created forgot password object
 */
const forgotPasswordResponse = (item) => {
  let data = {
    msg: 'RESET_EMAIL_SENT',
    email: item.email
  }
  if (process.env.NODE_ENV !== 'production') {
    data = {
      ...data,
      verification: item.verification
    }
  }
  return data
}

/**
 * Registers a new user in database
 * @param {Object} req - request object
 */
const registerUser = async (req) => {
  return new Promise(async (resolve, reject) => {
    const user = {
      name: req.name,
      email: req.email,
      phone: req.phone,
      password: req.password,
      verification: uuid.v4()
    }
    User.create(user)
      .then((item) => {
        resolve(item)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
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
    token: generateToken(item.id),
    user: userInfo
  }
  return data
}

/**
 * Checks against user if has quested role
 * @param {Object} data - data object
 * @param {*} next - next callback
 */
const checkPermissions = async (data, next) => {
  return new Promise((resolve, reject) => {
    User.findByPk(data.id)
      .then((user) => {
        if (!user) {
          return reject(utils.buildErrObject(401, 'NOT_FOUND'))
        }
        if (data.roles.indexOf(user.role) > -1) {
          return resolve(next())
        }
        return reject(utils.buildErrObject(401, 'UNAUTHORIZED'))
      })
      .catch((err) => {
        return reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Gets user id from token
 * @param {string} token - Encrypted and encoded token
 */
const getUserIdFromToken = async (token) => {
  return new Promise((resolve, reject) => {
    // Decrypts, verifies and decode token
    jwt.verify(auth.decrypt(token), process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(utils.buildErrObject(409, 'BAD_TOKEN'))
      }
      resolve(decoded.data.id)
    })
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.login = async (req, res) => {
  try {
    const data = matchedData(req)
    const user = await findUser(data.email)
    await userIsBlocked(user)
    await checkLoginAttemptsAndBlockExpires(user)
    const isPasswordMatch = await auth.checkPassword(data.password, user)
    if (!isPasswordMatch) {
      utils.handleError(res, await passwordsDoNotMatch(user))
    } else {
      // all ok, register access and return token
      user.loginAttempts = 0
      await saveLoginAttemptsToDB(user)
      res.status(200).json(await saveUserAccessAndReturnToken(req, user))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
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
      emailer.sendRegistrationEmailMessage(item)
      res.status(201).json(response)
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Verify function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.verify = async (req, res) => {
  try {
    req = matchedData(req)
    const user = await verificationExists(req.id)
    res.status(200).json(await verifyUser(user))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Forgot password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.forgotPassword = async (req, res) => {
  try {
    const data = matchedData(req)
    await findUser(data.email)
    const item = await saveForgotPassword(req)
    emailer.sendResetPasswordEmailMessage(item)
    res.status(200).json(forgotPasswordResponse(item))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Reset password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.resetPassword = async (req, res) => {
  try {
    const data = matchedData(req)
    const forgotPassword = await findForgotPassword(data.id)
    const user = await findUserToResetPassword(forgotPassword.email)
    await updatePassword(data.password, user)
    const result = await markResetPasswordAsUsed(req, forgotPassword)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Refresh token function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getRefreshToken = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()
    const userId = await getUserIdFromToken(tokenEncrypted)
    const user = await findUserById(userId)
    const token = await saveUserAccessAndReturnToken(req, user)
    // Removes user info from response
    delete token.user
    res.status(200).json(token)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Roles authorization function called by route
 * @param {Array} roles - roles specified on the route
 */
exports.roleAuthorization = (roles) => async (req, res, next) => {
  try {
    const data = {
      id: req.user.id,
      roles
    }
    await checkPermissions(data, next)
  } catch (error) {
    utils.handleError(res, error)
  }
}
