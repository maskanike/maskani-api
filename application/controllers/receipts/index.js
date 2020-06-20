const { Flat, Receipt, Tenant } = require('../../models')

const { matchedData } = require('express-validator')
const utils = require('../../middleware/utils')
const db = require('../../middleware/db')
const emailer = require('../../middleware/emailer')
const smser = require('../../middleware/smser')
const { getYear } = require('date-fns')

/*********************
 * Private functions *
 *********************/

/**
 * Update tenant object
 * @param {object} req - request object
 * @param {number} lastReceiptSentId - Id of last receipt sent
 */
const updateTenantObject = async (req, lastReceiptSentId) => {
  return new Promise((resolve, reject) => {
    const lastReceiptSentAt = new Date()
    Tenant.update(
      {
        lastReceiptSentAt,
        receiptAmount: req.amount,
        lastReceiptSentId
      },
      { where: { id: req.TenantId }, returning: true, plain: true }
    )
      .then((result) => {
        resolve(result[1].dataValues)
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
    res.status(200).json(await db.getItems(req, Receipt, query))
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
    res.status(200).json(await db.getItem(req.id, Receipt))
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
    res.status(200).json(await db.updateItem(id, Flat, req))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.sendItem = async (req, res) => {
  try {
    const user = req.user
    req = matchedData(req)
    const receipt = await db.createItem(req, Receipt)
    const tenant = await updateTenantObject(req, receipt.id)
    const notificationMetaData = {
      month: receipt.dueDate.toLocaleString('en-us', { month: 'short' }),
      year: getYear(receipt.dueDate),
      amount: req.amount,
      flat: tenant.flatName,
      unit: tenant.unitName
    }
    emailer.sendReceiptEmail(user, tenant, receipt, notificationMetaData)
    smser.sendReceiptSMS(user, notificationMetaData)
    res.status(201).json(receipt)
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
    res.status(200).json(await db.deleteItem(req.id, Receipt))
  } catch (error) {
    utils.handleError(res, error)
  }
}
