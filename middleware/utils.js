const { validationResult } = require('express-validator')

/**
 * Handles error by printing to console in development env and builds and sends an error response
 * @param {Object} res - response object
 * @param {Object} err - error object
 */
exports.handleError = (res, err) => {
    // Prints error in console
    if (process.env.NODE_ENV === 'development') {
      console.log(err)
    }
    // Sends error to user
    res.status(err.code).json({
      errors: {
        msg: err.message
      }
    })
  }

/**
 * Builds error object
 * @param {number} code - error code
 * @param {string} message - error text
 */
exports.buildErrObject = (code, message) => {
    return {
      code,
      message
    }
  }


/**
 * Builds error for validation files
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @param {Object} next - next object
 */
exports.validationResult = (req, res, next) => {
    try {
      validationResult(req).throw()
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase()
      }
      return next()
    } catch (err) {
      return this.handleError(res, this.buildErrObject(422, err.array()))
    }
  }


/**
 * Item already exists
 * @param {Object} err - error object
 * @param {Object} item - item result object
 * @param {Object} reject - reject object
 * @param {string} message - message
 */
exports.itemAlreadyExists = (err, item, reject, message) => {
    if (err) {
      reject(this.buildErrObject(422, err.message))
    }
    if (item) {
      reject(this.buildErrObject(422, message))
    }
  }