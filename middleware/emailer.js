const { User } = require('../models');
const utils = require('../middleware/utils')

module.exports = {
    /**
     * Checks User model if user with an specific email exists
     * @param {string} email - user email
     */
    async emailExists(email) {
      return new Promise((resolve, reject) => {
        User.findOne({ where: { email }})
          .then(item => {
            if(item){
              reject(utils.buildErrObject(422, 'EMAIL_ALREADY_EXISTS'))
            }
            resolve(false);
          })
          .catch(err => {
            reject(utils.buildErrObject(422, err.message));
          });
      });
    },

    /**
   * Sends registration email
   * @param {Object} user - user object
   */
  async sendRegistrationEmailMessage(user) {
    const subject = "Verify your email at Maskani"
    const htmlMessage = "<p>Hello %s.</p> <p>Welcome! To verify your email, please click in this link:</p> <p>%s/verify/%s</p> <p>Thank you.</p>"
    prepareToSendEmail(user, subject, htmlMessage)
  }
}
