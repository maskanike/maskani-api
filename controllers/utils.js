const { Flat, Unit } = require('../models')
const utils = require('../middleware/utils')


module.exports = {
/**
 * Gets flat belonging to user
 * @param {number} UserId - Id of user
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
  },

  /**
   * Gets flat by flatId
   * @param {number} id - Id of flat
   */
  async getFlat(id) {
    return new Promise((resolve, reject) => {
      Flat.findOne(
        { 
          where: { id },
          exclude: ['updatedAt','createdAt'],
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
  },

  /**
   * Gets unit by tenantId
   * @param {number} TenantId - Id of tenant
   */
  async getUnitByTenantId(TenantId) {
    return new Promise((resolve, reject) => {
      Unit.findOne(
        { 
          where: { TenantId },
          exclude: ['updatedAt','createdAt'],
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