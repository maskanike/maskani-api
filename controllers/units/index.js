const { Unit, Tenant, Sequelize } = require('../../models')
const { matchedData } = require('express-validator')
const { getFlatBelongingToUser } = require('../utils')
const utils = require('../../middleware/utils')
const db = require('../../middleware/db')

const Op = Sequelize.Op;

/*********************
 * Private functions *
 *********************/

/**
 * Checks if a unit already exists excluding itself
 * @param {string} id - id of unit
 * @param {string} name - name of unit
 * @param {number} FlatId - Id of flat the unit belongs to
 */
const unitExistsExcludingItself = async (id, name, FlatId) => {
  return new Promise((resolve, reject) => {
    Unit.findOne(
      { where: { name, FlatId, id: { [Op.ne]: id }}
    }).then(item => {
        if(item){
          reject(utils.buildErrObject(422, 'UNIT_ALREADY_EXISTS'))
        }
        resolve(false);
      })
      .catch(err => {
        reject(utils.buildErrObject(422, err.message));
      });
  })
}

/**
 * Checks if a unit already exists in database
 * @param {string} name - name of unit
 * @param {string} phone - phone of unit
 */
const unitExists = async (name, phone) => {
  return new Promise((resolve, reject) => {
    Unit.findOne({ where: { name, phone }}
    ).then(item => {
      if(item){
        reject(utils.buildErrObject(422, 'UNIT_ALREADY_EXISTS'))
      }
      resolve(false);
    })
    .catch(err => {
      reject(utils.buildErrObject(422, err.message));
    });
  })
}

/**
 * Gets all items from database
 * @param {number} FlatId - Flat Id
 */
const getAllItemsFromDB = async (FlatId) => {
  return new Promise((resolve, reject) => {
    Unit.findAll(
      { 
        where: { FlatId },
        include: [ Tenant ],
        exclude: ['updatedAt','createdAt'],
        order: [['name', 'DESC']]
      }).then(items => {
        resolve(items);
      })
      .catch(err => {
        reject(utils.buildErrObject(422, err.message));
      });
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
    const flat = await getFlatBelongingToUser(req.user.id);
    res.status(200).json(await getAllItemsFromDB(flat.id))
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
    const flat = await getFlatBelongingToUser(req.user.id);
    const query = await db.checkQueryString(req.query)
    res.status(200).json(await db.getItems(req, Unit, { ...query, FlatId:flat.id }))
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
    res.status(200).json(await db.getItem(req.id, Unit))
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
    const flat = await getFlatBelongingToUser(req.user.id);
    req = matchedData(req)
    const { id } = req
    const doesUnitExists = await unitExistsExcludingItself(id, req.name, req.phone, flat.id)
    if (!doesUnitExists) {
      res.status(200).json(await db.updateItem(id, Unit, req))
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
    const flat = await getFlatBelongingToUser(req.user.id);
    req = matchedData(req)
    const doesUnitExists = await unitExists(req.name, req.phone)
    if (!doesUnitExists) {
      res.status(201).json(await db.createItem({ ...req, FlatId: flat.id }, Unit))
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
    res.status(200).json(await db.deleteItem(req.id, Unit))
  } catch (error) {
    utils.handleError(res, error)
  }
}
