const { User } = require('../../models');
const utils = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const auth = require('../../middleware/auth')

/*********************
 * Private functions *
 *********************/

/**
 * Gets profile from database by id
 * @param {string} id - user id
 */
const getProfileFromDB = async (id) => {
  return new Promise((resolve, reject) => {
    User.findByPk(id)
      .then(user => {
        if (!user) {
          reject(utils.buildErrObject(422, 'NOT_FOUND'))
        }
        resolve(user)
      })
      .catch(err => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Updates profile in database
 * @param {Object} req - request object
 * @param {string} id - user id
 */
const updateProfileInDB = async (req, id) => {
  return new Promise((resolve, reject) => {
    User.update(
      req,
      { where: {id}})
      .then(user => {
        if(!user){
          reject(utils.buildErrObject(422, 'NOT_FOUND'))
        }
        resolve(user)
      })
      .catch(err => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Finds user by id
 * @param {string} email - user id
 */
const findUser = async (id) => {
  return new Promise((resolve, reject) => {
    User.findByPk(id, {attributes: ['password', 'email']})
    .then(user => {
      if (!user) {
        reject(utils.buildErrObject(422, 'USER_DOES_NOT_EXIST'))
      }
      resolve(user)
    })
    .catch(err => {
      reject(utils.buildErrObject(422, err.message))
    })
  })
}

/**
 * Build passwords do not match object
 * @param {Object} user - user object
 */
const passwordsDoNotMatch = async () => {
  return new Promise((resolve) => {
    resolve(utils.buildErrObject(409, 'WRONG_PASSWORD'))
  })
}

/**
 * Changes password in database
 * @param {string} id - user id
 * @param {Object} req - request object
 */
const changePasswordInDB = async (id, req) => {
  return new Promise((resolve, reject) => {
    User.update(
      { password: req.newPassword},
      { where: { id }})
      .then(user => {
        if(!user) {
          reject(utils.buildErrObject(422, 'NOT_FOUND'))
        }
        resolve(utils.buildSuccObject('PASSWORD_CHANGED'))
      })
      .catch(err => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Get profile function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getProfile = async (req, res) => {
  try {
    res.status(200).json(await getProfileFromDB(req.user.id))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Update profile function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateProfile = async (req, res) => {
  try {
    req = matchedData(req)
    res.status(200).json(await updateProfileInDB(req, req.user.id))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Change password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.changePassword = async (req, res) => {
  try {
    const {id} = req.user
    const user = await findUser(id)
    req = matchedData(req)
    const isPasswordMatch = await auth.checkPassword(req.oldPassword, user)
    if (!isPasswordMatch) {
      utils.handleError(res, await passwordsDoNotMatch())
    } else {
      // all ok, proceed to change password
      res.status(200).json(await changePasswordInDB(id, req))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}
