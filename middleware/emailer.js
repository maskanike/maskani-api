const { User, Notification, Sequelize } = require('../models');
const utils = require('../middleware/utils')
const Mailgun = require('mailgun-js');

const Op = Sequelize.Op;

/**
 * 
 * @param {Object} data 
 */
const logEmail = async(data) => {
  Notification.create(data);
}

/**
 * 
 * @param {Object} data 
 * @param {Object} error 
 */
const logFailedEmailSending = async(data, err) => {
  const failedEmail = {
    message: data.htmlMessage,
    destination: data.to.email,
    type: 'email',
    error: err,
    status: 'failed',
  }
  logEmail(failedEmail);
}

/**
 * 
 * @param {Object} data 
 */
const logSuccessfulEmailSending = async(data) => {
  const successEmail = {
    message: data.htmlMessage,
    destination: data.to.email,
    type: 'email',
    status: 'success',
  }
  logEmail(successEmail);
}

/**
 * Sends email
 * @param {Object} data - data
 * @param {boolean} callback - callback
 */
const sendEmail = async (data, callback) => {
  const mailgun = new Mailgun({
    apiKey: process.env.EMAIL_SMTP_API_MAILGUN,
    domain: process.env.EMAIL_SMTP_DOMAIN_MAILGUN
  });
  const email = {
    from: `${data.from.name} <${data.from.email}>`,
    to: `${data.to.name} <${data.to.email}>`,
    subject: data.subject,
    html: data.htmlMessage,
  };

  mailgun.messages().send(email, async (err) => {
    if (err) {
      logFailedEmailSending(data, err);
      return callback(false)
    }
    logSuccessfulEmailSending(data);
    return callback(true)
  });
}

/**
 * Prepares to send email
 * @param {string} user - user object
 * @param {string} subject - subject
 * @param {string} htmlMessage - html message
 */
const prepareToSendEmail = (user, subject, htmlMessage) => {
  from = {
    name: 'Maskani Team',
    email: 'info@maskani.co.ke'
  }

  to = {
    name: user.name,
    email: user.email,
    verification: user.verification
  }
  const data = {
    from,
    to,
    subject,
    htmlMessage
  }
  if (process.env.NODE_ENV === 'production') {
    sendEmail(data, (messageSent) =>
      messageSent
        ? console.log(`Email SENT to: ${to.email}`)
        : console.log(`Email FAILED to: ${to.email}`)
    )
  } else if (process.env.NODE_ENV === 'development') {
    console.log(data)
  }
}

/**
 * Prepares to send email
 * @param {string} user - user object
 * @param {string} tenant - tenant object
 * @param {string} subject - subject
 * @param {string} htmlMessage - html message
 */
const prepareToSendTenantEmail = (user, tenant, subject, htmlMessage) => {
  from = {
    name: user.name,
    email: user.email,
  }
  to = {
    name: tenant.name,
    email: tenant.email
  }
  const data = {
    from,
    to,
    subject,
    htmlMessage
  }
  if (process.env.NODE_ENV === 'production') {
    sendEmail(data, (messageSent) =>
      messageSent
        ? console.log(`Email SENT to: ${to.email}`)
        : console.log(`Email FAILED to: ${to.email}`)
    )
  } else if (process.env.NODE_ENV === 'development') {
    console.log(data)
  }
}

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
   * Checks User model if user with an specific email exists but excluding user id
   * @param {string} id - user id
   * @param {string} email - user email
   */
  async emailExistsExcludingMyself(id, email) {
    return new Promise((resolve, reject) => {
      User.findOne({
          where: { email, id: { [Op.ne]: id }}
      }).then(item => {
        if(item){
          reject(utils.buildErrObject(422, 'EMAIL_ALREADY_EXISTS'))
        }
        resolve(false);
      })
      .catch(err => {
        reject(utils.buildErrObject(422, err.message));
      });
    })
  },

  /**
   * Sends registration email
   * @param {Object} user - user object
   */
  async sendRegistrationEmailMessage(user) {
    const subject = "Verify your email at Maskani"
    const htmlMessage = `<p>Hello ${user.name}.</p> <p>Welcome! To verify your email, please click in this link:</p> <p>${process.env.FRONTEND_URL}/verify/${user.verification}</p> <p>Thank you.</p>`
    prepareToSendEmail(user, subject, htmlMessage)
  },
  
  /**
   * Sends reset password email
   * @param {Object} user - user object
   */
  async sendResetPasswordEmailMessage(user) {
    const subject = "Password recovery at Maskani"
    const htmlMessage = `<p>To recover the password for user: ${user.name}</p> <p>click the following link:</p> <p>${process.env.FRONTEND_URL}/reset/${user.verification}</p> <p>If this was a mistake, you can ignore this message.</p> <p>Thank you.</p>`
    prepareToSendEmail(user, subject, htmlMessage)
  },

  /**
   * Sends invoice email
   * @param {Object} user - user object
   * @param {Object} tenant - tenant object
   * @param {Object} invoice - invoice object
   */
  async sendInvoiceEmail(user, tenant, invoice) {
    const subject = "Your Invoice for This Month"
    const htmlMessage = `<p>Hello ${tenant.name}.</p> <p>Welcome! Your invoice for this month is ${invoice.rent} Shs.</p> <p>Thank you.</p>`
    prepareToSendTenantEmail(user, tenant, subject, htmlMessage)
  },
}
