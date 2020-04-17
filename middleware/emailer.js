module.exports = {
    /**
     * Checks User model if user with an specific email exists
     * @param {string} email - user email
     */
    async emailExists(email) {
      return new Promise((resolve, reject) => {
          // TODO make this a sequelize function
        User.findOne(
          {
            email
          },
          (err, item) => {
            itemAlreadyExists(err, item, reject, 'EMAIL_ALREADY_EXISTS')
            resolve(false)
          }
        )
      })
    },

    /**
   * Sends registration email
   * @param {string} locale - locale
   * @param {Object} user - user object
   */
  async sendRegistrationEmailMessage(locale, user) {
    i18n.setLocale(locale)
    const subject = i18n.__('registration.SUBJECT')
    const htmlMessage = i18n.__(
      'registration.MESSAGE',
      user.name,
      process.env.FRONTEND_URL,
      user.verification
    )
    prepareToSendEmail(user, subject, htmlMessage)
  }
}
