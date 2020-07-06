const models = require('../../models')
const uuid = require('uuid')
const { matchedData } = require('express-validator')
const utils = require('../../middleware/utils')
const db = require('../../middleware/db')
const emailer = require('../../middleware/emailer')

/*********************
 * Private functions *
 *********************/

/**
 * Creates a new item in database
 * @param {Object} req - request object
 */
const createItem = async (req) => {
  return new Promise((resolve, reject) => {
    models.User.create({
      name: req.name,
      email: req.email,
      password: req.password,
      role: req.role,
      phone: req.phone,
      verification: uuid.v4()
    })
      .then((item) => {
        // Removes properties with rest operator
        const removeProperties = ({
          // eslint-disable-next-line no-unused-vars
          password,
          // eslint-disable-next-line no-unused-vars
          blockExpires,
          // eslint-disable-next-line no-unused-vars
          loginAttempts,
          ...rest
        }) => rest
        resolve(removeProperties(item.dataValues))
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItems = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    res.status(200).json(await db.getItems(req, models.User, query))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItem = async (req, res) => {
  try {
    req = matchedData(req)
    res.status(200).json(await db.getItem(req.id, models.User))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateItem = async (req, res) => {
  try {
    req = matchedData(req)
    const { id } = req
    const doesEmailExists = await emailer.emailExistsExcludingMyself(
      id,
      req.email
    )
    if (!doesEmailExists) {
      res.status(200).json(await db.updateItem(id, models.User, req))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createItem = async (req, res) => {
  try {
    req = matchedData(req)
    const doesEmailExists = await emailer.emailExists(req.email)
    if (!doesEmailExists) {
      const item = await createItem(req)
      emailer.sendRegistrationEmailMessage(item)
      res.status(201).json(item)
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.deleteItem = async (req, res) => {
  try {
    req = matchedData(req)
    res.status(200).json(await db.deleteItem(req.id, models.User))
  } catch (error) {
    utils.handleError(res, error)
  }
}
