const { Flat, Sequelize } = require('../../models')
const { matchedData } = require('express-validator')
const utils = require('../../middleware/utils')
const db = require('../../middleware/db')

const Op = Sequelize.Op;

/*********************
 * Private functions *
 *********************/

/**
 * Checks if a invoice already exists excluding itself
 * @param {string} id - id of item
 * @param {string} name - name of item
 */
const flatExistsExcludingItself = async (id, name) => {
  return new Promise((resolve, reject) => {
    Invoice.findOne(
      { where: { name, id: { [Op.ne]: id }}
    }).then(item => {
        if(item){
          reject(utils.buildErrObject(422, 'FLAT_ALREADY_EXISTS'))
        }
        resolve(false);
      })
      .catch(err => {
        reject(utils.buildErrObject(422, err.message));
      });
  })
}

/**
 * Checks if a flat already exists in database
 * @param {string} name - name of item
 */
const flatExists = async (name) => {
  return new Promise((resolve, reject) => {
    Flat.findOne({ where: { name }}
    ).then(item => {
      if(item){
        reject(utils.buildErrObject(422, 'FLAT_ALREADY_EXISTS'))
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
 */
const getAllItemsFromDB = async (flatId) => {
  return new Promise((resolve, reject) => {
    Invoice.findAll(
      { 
        where: { FlatId: flatId },
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
    const doesFlatExists = await flatExistsExcludingItself(id, req.name)
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
exports.createItem = async (req, res) => {
  try {
    req = matchedData(req)
    const doesFlatExists = await flatExists(req.name)
    if (!doesFlatExists) {
      res.status(201).json(await db.createItem(req, Flat))
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
    res.status(200).json(await db.deleteItem(req.id, Flat))
  } catch (error) {
    utils.handleError(res, error)
  }
}
