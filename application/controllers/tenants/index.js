const { Tenant, Unit, Sequelize } = require('../../models')
const { matchedData } = require('express-validator')
const { getFlatBelongingToUser } = require('../utils')
const utils = require('../../middleware/utils')
const db = require('../../middleware/db')

const Op = Sequelize.Op

/*********************
 * Private functions *
 *********************/

/**
 * Checks if a tenant already exists excluding itself
 * @param {string} id - id of tenant
 * @param {string} email - email of tenant
 * @param {string} phone - mobile number of tenant
 * @param {number} FlatId - Id of flat the tenant belongs to
 */
const tenantExistsExcludingItself = async (id, email, phone, FlatId) => {
  return new Promise((resolve, reject) => {
    Tenant.findOne({ where: { email, phone, FlatId, id: { [Op.ne]: id } } })
      .then((item) => {
        if (item) {
          reject(utils.buildErrObject(422, 'TENANT_ALREADY_EXISTS'))
        }
        resolve(false)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Checks if a tenant already exists in database
 * @param {string} email - email of tenant
 * @param {string} phone - phone of tenant
 */
const tenantExists = async (email, phone) => {
  return new Promise((resolve, reject) => {
    Tenant.findOne({ where: { email, phone } })
      .then((item) => {
        if (item) {
          reject(utils.buildErrObject(422, 'TENANT_ALREADY_EXISTS'))
        }
        resolve(false)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Assign a unit to a tenant
 * @param {number} TenantId - id of tenant
 * @param {number} unitId - id of unit
 */
const assignTenantToUnit = async (TenantId, unitId) => {
  return new Promise((resolve, reject) => {
    Unit.findOne({ where: { id: unitId } })
      .then(async (item) => {
        if (!item) {
          reject(utils.buildErrObject(422, 'UNIT_NOT_FOUND'))
        }
        const unit = await db.updateItem(item.id, Unit, { TenantId })
        resolve(unit)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Mark unit as empty belong to tenant
 * @param {number} TenantId - id of tenant
 */
const markUnitAsEmpty = async (TenantId) => {
  return new Promise((resolve, reject) => {
    Unit.update({ TenantId: null }, { where: { TenantId } })
      .then(async () => {
        resolve(true)
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Mark tenant as moved out
 * @param {number} id - id of tenant
 */
const markTenantAsMovedOut = async (id) => {
  return new Promise((resolve, reject) => {
    Tenant.update(
      { status: 'left' },
      { where: { id }, returning: true, plain: true }
    )
      .then(async (tenant) => {
        resolve(tenant[1])
      })
      .catch((err) => {
        reject(utils.buildErrObject(422, err.message))
      })
  })
}

/**
 * Gets all items from database
 * @param {number} FlatId - email of tenant
 */
const getAllItemsFromDB = async (FlatId) => {
  return new Promise((resolve, reject) => {
    Tenant.findAll({
      where: { FlatId },
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
    const flat = await getFlatBelongingToUser(req.user.id)
    const query = await db.checkQueryString(req.query)
    res
      .status(200)
      .json(await db.getItems(req, Tenant, { ...query, FlatId: flat.id }))
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
    res.status(200).json(await db.getItem(req.id, Tenant))
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
    const flat = await getFlatBelongingToUser(req.user.id)
    req = matchedData(req)
    const { id } = req
    const doesTenantExists = await tenantExistsExcludingItself(
      id,
      req.email,
      req.phone,
      flat.id
    )
    if (!doesTenantExists) {
      res.status(200).json(await db.updateItem(id, Tenant, req))
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
    const flat = await getFlatBelongingToUser(req.user.id)
    req = matchedData(req)
    const doesTenantExists = await tenantExists(req.name, req.phone)
    if (!doesTenantExists) {
      const tenant = await db.createItem(
        { ...req, FlatId: flat.id, flatName: flat.name },
        Tenant
      )
      await assignTenantToUnit(tenant.id, req.UnitId, flat.id)
      res.status(201).json(tenant)
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
    res.status(200).json(await db.deleteItem(req.id, Tenant))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Mark tenant as moved out function
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.movedOut = async (req, res) => {
  try {
    req = matchedData(req)
    const tenant = await markTenantAsMovedOut(req.id)
    await markUnitAsEmpty(req.id)
    res.status(200).json(tenant)
  } catch (error) {
    utils.handleError(res, error)
  }
}
