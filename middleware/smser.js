const { User, Notification, Sequelize } = require('../models');
const utils = require('./utils')
const axios = require('axios');

const Op = Sequelize.Op;

/**
 * 
 * @param {Object} data 
 */
const logSMS = async(data) => {
  Notification.create(data);
}

/**
 * 
 * @param {Object} data 
 * @param {Object} error 
 */
const logFailedSMSSending = async(data, err) => {
  const failedSMS = {
    message: data.message,
    destination: data.msisdn,
    type: 'sms',
    error: err,
    status: 'failed',
  }
  logSMS(failedSMS);
}

/**
 * 
 * @param {Object} data 
 */
const logSuccessfulSMSSending = async(data) => {
  const successSMS = {
    message: data.message,
    destination: data.msisdn,
    type: 'sms',
    status: 'success',
  }
  logSMS(successSMS);
}

/**
 * Sends sms
 * @param {Object} data - data
 * @param {boolean} callback - callback
 */
const sendSMS = async (data, callback) => {
  const messagePayload = `to=${data.msisdn}&message=${encodeURIComponent(data.message)}&username=${process.env.AT_USERNAME}`;
  const options = {
    url: 'https://api.africastalking.com/version1/messaging',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      apikey: process.env.AT_APIKEY,
      Accept: 'application/json',
    },
    data: messagePayload,
  };

  axios(options)
    .then(() => {
      logSuccessfulSMSSending(data);
      return callback(true)
    })
    .catch(err => {
      logFailedSMSSending(data, err);
      return callback(false)
    });
}

/**
 * Prepares to send sms
 * @param {string} user - user object
 * @param {string} subject - subject
 * @param {string} message - text message
 */
const prepareToSendSMS = (user, message) => {
  const data = {
    msisdn: user.phone,
    message
  }
  if (process.env.NODE_ENV === 'production') {
    sendSMS(data, (messageSent) =>
      messageSent
        ? console.log(`SMS SENT to: ${user.phone}`)
        : console.log(`SMS FAILED to: ${user.phone}`)
    )
  } else if (process.env.NODE_ENV === 'development') {
    console.log(data)
  }
}

module.exports = {
    /**
     * Checks User model if user with an specific phone exists
     * @param {string} phone - user phone
     */
    async phoneExists(phone) {
      return new Promise((resolve, reject) => {
        User.findOne({ where: { phone }})
          .then(item => {
            if(item){
              reject(utils.buildErrObject(422, 'PHONE_ALREADY_EXISTS'))
            }
            resolve(false);
          })
          .catch(err => {
            reject(utils.buildErrObject(422, err.message));
          });
      });
    },


  /**
   * Checks User model if user with an specific phone exists but excluding user id
   * @param {string} id - user id
   * @param {string} phone - user phone
   */
  async phoneExistsExcludingMyself(id, phone) {
    return new Promise((resolve, reject) => {
      User.findOne({
          where: { phone, id: { [Op.ne]: id }}
      }).then(item => {
        if(item){
          reject(utils.buildErrObject(422, 'PHONE_ALREADY_EXISTS'))
        }
        resolve(false);
      })
      .catch(err => {
        reject(utils.buildErrObject(422, err.message));
      });
    })
  },
  
  /**
   * Sends reset password sms
   * @param {Object} user - user object
   * @param {Object} invoice - invoice object
   */
  async sendInvoiceSMS(user, invoice) {
    const message = `Hey ${user.name}, Your Invoice is ready. Rent: ${invoice.rent}`
    prepareToSendSMS(user, message)
  }
}
