const { Flat } = require('../models')
const utils = require('../middleware/utils')


module.exports = {
/**
 * Gets flat belonging to user
 * @param {number} FlatId - email of tenant
 */
async getFlatBelongingToUser(UserId) {
    return new Promise((resolve, reject) => {
      Flat.findOne(
        { 
          where: { UserId },
          exclude: ['updatedAt','createdAt'],
          order: [['name', 'DESC']]
        }).then(flat => {
          if(!flat) {
            reject(utils.buildErrObject(422, 'FLAT_NOT_FOUND_FOR_USER'))
          }
          resolve(flat);
        })
        .catch(err => {
          reject(utils.buildErrObject(422, err.message));
        });
    })
  }
 }