const { Invoice, Receipt, Tenant } = require('../../models')

const { matchedData } = require('express-validator')
const utils = require('../../middleware/utils')
const db = require('../../middleware/db')
const emailer = require('../../middleware/emailer')
const smser = require('../../middleware/smser')

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

/**
 * Update tenant object
 * @param {object} amount - amount paid
 * @param {number} InvoiceId - Id of which payment is being made
 */
const updateInvoiceObject = async (amount, InvoiceId) => {
  return new Promise((resolve, reject) => {
    Invoice.findByPk(InvoiceId).then((invoice) => {
      invoice.amountPaid += Number(amount)
      invoice
        .save()
        .then(() => {
          resolve(true)
        })
        .catch((err) => {
          reject(utils.buildErrObject(422, err.message))
        })
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
    await updateInvoiceObject(req.amount, receipt.InvoiceId)

    const notificationMetaData = {
      flat: tenant.flatName,
      unit: tenant.unitName,
      amount: receipt.amount,
      InvoiceId: receipt.InvoiceId
    }
    emailer.sendReceiptEmail(user, tenant, notificationMetaData)
    smser.sendReceiptSMS(tenant, notificationMetaData)
    res.status(201).json(receipt)
  } catch (error) {
    utils.handleError(res, error)
  }
}
