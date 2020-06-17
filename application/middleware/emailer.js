const { User, Notification, Sequelize } = require('../models')
const utils = require('../middleware/utils')
const Mailgun = require('mailgun-js')

const Op = Sequelize.Op

const EMAIL_HEADER =
  '<div style="background-color: #FAFAFA; width: 100%; font-family: "Arial", "Helvetica Neue", "Helvetica", sans-serif; box-sizing: border-box; padding-bottom: 25px; margin: 0;">' +
  '<div style="background: transparent; padding-top: 30px; padding-bottom: 20px; text-align: center;">' +
  '<img style="display: inline-block; height: 30px; width: auto; margin-left: auto; margin-right: auto;" alt="Logo" src="https://maskani.co.ke/img/maskani_logo.png"/>' +
  '</div><div style="background-color: #fff; color: #000; font-size: 1em; border-top: 2px solid #00ACC4; border-bottom: 1px solid #E6E6E6; box-sizing: border-box; padding: 25px; width: 100%; max-width: 600px; margin-left: auto; margin-right: auto;">'

const EMAIL_FOOTER =
  '</div>' +
  '<div style="text-align: center; padding-top: 15px; margin-bottom: 15px; font-size: 12px;">' +
  '  <a style="color: #00ACC4;" href="/contact">Help</a>' +
  '  <span style="color: #ccc;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>' +
  '  <a style="color: #00ACC4;" href="/terms-of-service">Terms of Service</a>' +
  '  <span style="color: #ccc;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>' +
  '  <a style="color: #00ACC4;" href="/privacy-policy">Privacy Policy</a>' +
  '</div>'

/**
 * Log email in database
 * @param {Object} data
 */
const logEmail = async (data) => {
  Notification.create(data)
}

/**
 * Log failed email sending
 * @param {Object} data
 * @param {Object} error
 */
const logFailedEmailSending = async (data, err) => {
  const failedEmail = {
    message: data.htmlMessage,
    destination: data.to.email,
    type: 'email',
    error: err,
    status: 'failed'
  }
  logEmail(failedEmail)
}

/**
 *
 * @param {Object} data
 */
const logSuccessfulEmailSending = async (data) => {
  const successEmail = {
    message: data.htmlMessage,
    destination: data.to.email,
    type: 'email',
    status: 'success'
  }
  logEmail(successEmail)
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
  })
  const email = {
    from: `${data.from.name} <${data.from.email}>`,
    to: `${data.to.name} <${data.to.email}>`,
    subject: data.subject,
    html: data.htmlMessage
  }

  mailgun.messages().send(email, async (err) => {
    if (err) {
      logFailedEmailSending(data, err)
      return callback(false)
    }
    logSuccessfulEmailSending(data)
    return callback(true)
  })
}

/**
 * Prepares to send email
 * @param {object} user - user object
 * @param {string} subject - subject
 * @param {string} htmlMessage - html message
 * @param {object} tenant - tenant object. can be null
 */
const prepareToSendEmail = (user, subject, htmlMessage, tenant = null) => {
  let to
  let from

  if (tenant) {
    // email sent to tenant from user (agent)
    from = { name: user.name, email: user.email }
    to = { name: tenant.name, email: tenant.email }
  } else {
    from = { name: 'Maskani Team', email: 'info@maskani.co.ke' }
    to = { name: user.name, email: user.email, verification: user.verification }
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
 * Format email for sending
 * @param {string} htmlMessage - html content of email
 * @param {string} name - name of recepient
 */
const formatEmail = (htmlMessage, name) => {
  return (
    `${EMAIL_HEADER}<p style="margin-bottom: 25px;">Dear ${name},</p>` +
    `<p style="margin-bottom: 25px;">` +
    `${htmlMessage}` +
    '</ul> <br>' +
    '<p style="margin-top: 10px;">Sincerely,</p> ' +
    `<p style="margin-top: 2px;">The Maskani Team</p>${EMAIL_FOOTER}`
  )
}

module.exports = {
  /**
   * Checks User model if user with an specific email exists
   * @param {string} email - user email
   */
  async emailExists(email) {
    return new Promise((resolve, reject) => {
      User.findOne({ where: { email } })
        .then((item) => {
          if (item) {
            reject(utils.buildErrObject(422, 'EMAIL_ALREADY_EXISTS'))
          }
          resolve(false)
        })
        .catch((err) => {
          reject(utils.buildErrObject(422, err.message))
        })
    })
  },

  /**
   * Checks User model if user with an specific email exists but excluding user id
   * @param {string} id - user id
   * @param {string} email - user email
   */
  async emailExistsExcludingMyself(id, email) {
    return new Promise((resolve, reject) => {
      User.findOne({
        where: { email, id: { [Op.ne]: id } }
      })
        .then((item) => {
          if (item) {
            reject(utils.buildErrObject(422, 'EMAIL_ALREADY_EXISTS'))
          }
          resolve(false)
        })
        .catch((err) => {
          reject(utils.buildErrObject(422, err.message))
        })
    })
  },

  /**
   * Sends registration email
   * @param {Object} user - user object
   */
  async sendRegistrationEmailMessage(user) {
    const subject = 'Verify your email at Maskani'
    const htmlMessage = `<p>Welcome! To verify your email, please click in this link:</p> <p>${process.env.FRONTEND_URL}/verify/${user.verification}</p> <p>Thank you.</p>`
    const formattedEmail = formatEmail(htmlMessage, user.name)
    prepareToSendEmail(user, subject, formattedEmail)
  },

  /**
   * Sends reset password email
   * @param {Object} user - user object
   */
  async sendResetPasswordEmailMessage(user) {
    const subject = 'Password recovery at Maskani'
    const htmlMessage = `<p>To recover the password for user: ${user.name}</p> <p>click the following link:</p> <p>${process.env.FRONTEND_URL}/reset/${user.verification}</p> <p>If this was a mistake, you can ignore this message.</p> <p>Thank you.</p>`
    const formattedEmail = formatEmail(htmlMessage, user.name)
    prepareToSendEmail(user, subject, formattedEmail)
  },

  /**
   * Sends invoice email
   * @param {object} user - user object
   * @param {object} tenant - tenant object
   * @param {object} invoice - invoice object
   * @param {object} notificationMetaData - metadata used to send notification
   */
  async sendInvoiceEmail(user, tenant, invoice, notificationMetaData) {
    const subject = `Your Invoice for ${notificationMetaData.month} - ${notificationMetaData.year} | ${notificationMetaData.flat}`

    const htmlMessage =
      `Thank you for being a tenant at <b> ${notificationMetaData.flat} </b> unit  <b> ${notificationMetaData.unit}</b>. ` +
      `Your invoice for ${notificationMetaData.month} ${notificationMetaData.year} is ready.</p>` +
      `<p style="margin-bottom: 25px;">Please pay <b> ${notificationMetaData.totalRentAmount} KSHS</b> before ${invoice.dueDate}.</p> ` +
      '<p style="margin-bottom: 25px;">Your rental breakdown is as follows:</p>' +
      '<ul class="list-group list-group-flush"></ul>' +
      `<li class="list-group-item">Rent Due: <a style="color: #28AFB0; word-wrap: break-word;"> ${invoice.rent}</a></li>` +
      `<li class="list-group-item">Water Bill: <a style="color: #28AFB0; word-wrap: break-word;"> ${invoice.water}</a></li>` +
      `<li class="list-group-item">Garbage: <a style="color: #28AFB0; word-wrap: break-word;"> ${invoice.garbage}</a></li>` +
      `<li class="list-group-item">Penalty: <a style="color: #28AFB0; word-wrap: break-word;"> ${invoice.penalty}</a></li>`

    const formattedEmail = formatEmail(htmlMessage, user.name)
    prepareToSendEmail(user, subject, formattedEmail, tenant)
  },

  /**
   * Sends reminder email
   * @param {object} user - user object
   * @param {object} tenant - tenant object
   * @param {object} reminder - reminder object
   * @param {object} notificationMetaData - metadata used to send notification
   */
  async sendReminderEmail(user, tenant, reminder, notificationMetaData) {
    const subject = `Your Invoice for ${notificationMetaData.month} - ${notificationMetaData.year} | ${notificationMetaData.flat}`

    const htmlMessage =
      `This is a polite reminder to pay your invoice for <b> ${notificationMetaData.month} - ${notificationMetaData.year} </b>` +
      `<p style="margin-bottom: 25px;">Kshs <b> ${notificationMetaData.totalRentAmount} KSHS</b> is due on ${notificationMetaData.dueDate}.</p> ` +
      '<p style="margin-bottom: 25px;">Message sent by admin:</p>' +
      `<p style="margin-bottom: 25px;"><b> ${reminder.message} <b></p>`

    const formattedEmail = formatEmail(htmlMessage, user.name)
    prepareToSendEmail(user, subject, formattedEmail, tenant)
  }
}
