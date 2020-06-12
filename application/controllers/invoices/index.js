const { Flat, Invoice, Tenant, Reminder, Sequelize } = require('../../models')

const { matchedData } = require('express-validator')
const utils = require('../../middleware/utils')
const db = require('../../middleware/db')
const emailer = require('../../middleware/emailer')
const smser = require('../../middleware/smser')
const { getInvoice, getTenant } = require('../utils')
const { getYear } = require('date-fns')

const Op = Sequelize.Op

/*********************
 * Private functions *
 *********************/

/**
 * Checks if a invoice already exists excluding itself
 * @param {string} id - id of item
 * @param {string} name - name of item
 */
const invoiceExistsExcludingItself = async (id, name) => {
  return new Promise((resolve, reject) => {
    Invoice.findOne({ where: { name, id: { [Op.ne]: id } } })
      .then((item) => {
        if (item) {
          reject(utils.buildErrObject(422, 'FLAT_ALREADY_EXISTS'))
        }
        resolve(false)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Gets all items from database
 */
const getAllItemsFromDB = async (flatId) => {
  return new Promise((resolve, reject) => {
    Invoice.findAll({
      where: { FlatId: flatId },
      exclude: ['updatedAt', 'createdAt'],
      order: [['name', 'DESC']]
    })
      .then((items) => {
        resolve(items)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Update tenant object
 * @param {object} req - request object
 * @param {number} lastInvoiceSentId - Id of last invoice sent
 */
const updateTenantObject = async (req, lastInvoiceSentId) => {
  return new Promise((resolve, reject) => {
    const lastInvoiceSentAt = new Date()
    Tenant.update(
      {
        lastInvoiceSentAt,
        rent: req.rent,
        water: req.water,
        garbage: req.garbage,
        penalty: req.penalty,
        lastInvoiceSentId
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
 * @param {object} invoice - invoice object
 */
const calculateTotalRent = (invoice) => {
  return invoice.rent + invoice.penalty + invoice.water + invoice.garbage
}

/********************
 * Public functions *
 ********************/

/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItems = async (req, res) => {
  try {
    res.status(200).json(await getAllItemsFromDB(req.user.FlatId))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItems = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    res.status(200).json(await db.getItems(req, Invoice, query))
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
    res.status(200).json(await db.getItem(req.id, Invoice))
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
    const doesFlatExists = await invoiceExistsExcludingItself(id, req.name)
    if (!doesFlatExists) {
      res.status(200).json(await db.updateItem(id, Flat, req))
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
exports.sendItem = async (req, res) => {
  try {
    const user = req.user
    req = matchedData(req)
    const invoice = await db.createItem(req, Invoice)
    const tenant = await updateTenantObject(req, invoice.id)

    const totalRentAmount = calculateTotalRent(invoice)
    const notificationMetaData = {
      month: invoice.dueDate.toLocaleString('en-us', { month: 'short' }),
      year: getYear(invoice.dueDate),
      totalRentAmount,
      flat: tenant.flatName,
      unit: tenant.unitName
    }
    emailer.sendInvoiceEmail(user, tenant, invoice, notificationMetaData)
    smser.sendInvoiceSMS(user, notificationMetaData)
    res.status(201).json(invoice)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Send reminder function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.sendReminder = async (req, res) => {
  try {
    const user = req.user
    req = matchedData(req)
    const reminder = await db.createItem(req, Reminder)
    const invoice = await getInvoice(req.InvoiceId)
    const tenant = await getTenant(invoice.TenantId)
    const totalRentAmount = calculateTotalRent(invoice)

    const notificationMetaData = {
      month: invoice.dueDate.toLocaleString('en-us', { month: 'short' }),
      year: getYear(invoice.dueDate),
      totalRentAmount,
      flat: tenant.flatName,
      dueDate: invoice.dueDate
    }
    emailer.sendReminderEmail(user, tenant, reminder, notificationMetaData)
    smser.sendReminderSMS(user, notificationMetaData)
    res.status(201).json(reminder)
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
    res.status(200).json(await db.deleteItem(req.id, Invoice))
  } catch (error) {
    utils.handleError(res, error)
  }
}
