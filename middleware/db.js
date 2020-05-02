const {
    buildSuccObject,
    buildErrObject,
  } = require('../middleware/utils')
  
  /**
   * Builds sorting
   * @param {string} sort - field to sort from
   * @param {number} order - order for query (1,-1)
   */
  const buildSort = (sort, order) => {
    const sortBy = {}
    sortBy[sort] = order
    return sortBy
  }
  
  /**
   * Hack for mongoose-paginate, removes 'id' from results
   * @param {Object} result - result object
   */
  const cleanPaginationID = (result) => {
    result.map((element) => delete element.id)
    return result
  }
  
  /**
   * Builds initial options for query
   * @param {Object} query - query object
   */
  const listInitOptions = async (req) => {
    return new Promise((resolve) => {
      const order = req.query.order || -1
      const sort = req.query.sort || 'createdAt'
      const sortBy = buildSort(sort, order)
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 5
      const options = {
        sort: sortBy,
        page,
        limit
      }
      resolve(options)
    })
  }
  
  module.exports = {
    /**
     * Checks the query string for filtering records
     * query.filter should be the text to search (string)
     * query.fields should be the fields to search into (array)
     * @param {Object} query - query object
     */
    async checkQueryString(query) {
      return new Promise((resolve, reject) => {
        try {
          if (
            typeof query.filter !== 'undefined' &&
            typeof query.fields !== 'undefined'
          ) {
            const data = {
              $or: []
            }
            const array = []
            // Takes fields param and builds an array by splitting with ','
            const arrayFields = query.fields.split(',')
            // Adds SQL Like %word% with regex
            arrayFields.map((item) => {
              array.push({
                [item]: {
                  $regex: new RegExp(query.filter, 'i')
                }
              })
            })
            // Puts array result in data
            data.$or = array
            resolve(data)
          } else {
            resolve({})
          }
        } catch (err) {
          console.log(err.message)
          reject(buildErrObject(422, 'ERROR_WITH_FILTER'))
        }
      })
    },
  
    /**
     * Gets items from database
     * @param {Object} req - request object
     * @param {Object} query - query object
     */
    async getItems(req, model, query) {
      const options = await listInitOptions(req)
      return new Promise((resolve, reject) => {
          model.findAll({ where: query }, options).then(items => {
            resolve(cleanPaginationID(items))
          }).catch(err => {
            reject(buildErrObject(422, err.message))
          })
      })
    },
  
    /**
     * Gets item from database by id
     * @param {string} id - item id
     */
    async getItem(id, model) {
      return new Promise((resolve, reject) => {
        model.findById(id, (err, item) => {
          itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(item)
        })
      })
    },
  
    /**
     * Creates a new item in database
     * @param {Object} req - request object
     */
    async createItem(req, model) {
      return new Promise((resolve, reject) => {
        model.create(req).then(item => {
            resolve(item)
          })
          .catch(err => {
            reject(buildErrObject(422, err.message))
          })
      })
    },
  
    /**
     * Updates an item in database by id
     * @param {string} id - item id
     * @param {Object} req - request object
     */
    async updateItem(id, model, req) {
      return new Promise((resolve, reject) => {
        model.update(
          req,
          { where: { id }, returning: true, plain: true }
          ).then(result => {
            if(!result){
              reject(buildErrObject(422, 'NOT_FOUND'))
            }
            resolve(result[1].dataValues)
          })
          .catch(err => {
            reject(buildErrObject(422, err.message))
          })
      })
    },
  
    /**
     * Deletes an item from database by id
     * @param {string} id - id of item
     */
    async deleteItem(id, model) {
      return new Promise((resolve, reject) => {
        model.destroy({
            where: { id }
        }).then(result => {
            if(!result){
              reject(buildErrObject(422, 'NOT_FOUND'))
            }
            resolve(buildSuccObject('DELETED'))
          }).catch(err => {
            reject(buildErrObject(422, err.message))
          })
      })
    }
  }
  