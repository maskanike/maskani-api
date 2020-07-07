const controller = require('../controllers/invoices')
const validate = require('../controllers/invoices/validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
require('../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Invoices routes
 */

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['user', 'admin']),
  trimRequest.all,
  controller.getItems
)

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validate.sendItem,
  controller.sendItem
)

/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validate.getItem,
  controller.getItem
)

/*
 * Create a reminder to pay an invoice
 */
router.post(
  '/reminder',
  requireAuth,
  AuthController.roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validate.sendReminder,
  controller.sendReminder
)

module.exports = router
