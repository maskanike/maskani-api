const controller = require('../controllers/flats')
const validate = require('../controllers/flats/validate')
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
 * Flats routes
 */

/*
 * Get all items route
 */
router.get(
  '/all',
  requireAuth,
  AuthController.roleAuthorization(['user', 'admin']),
  trimRequest.all,
  controller.getAllItems
)

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  controller.getItems
)

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.createItem,
  controller.createItem
)

/*
 * Create new item route
 */
router.post(
  '/users/:UserId',
  requireAuth,
  AuthController.roleAuthorization(['user','admin']),
  trimRequest.all,
  validate.createUserItem,
  controller.createUserItem
)

/*
 * Get flat by UserId route
 */
router.get(
  '/user',
  requireAuth,
  AuthController.roleAuthorization(['user','admin']),
  trimRequest.all,
  controller.getItemByUserId
)

/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.getItem,
  controller.getItem
)

/*
 * Update item route
 */
router.patch(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.updateItem,
  controller.updateItem
)

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem
)

module.exports = router
