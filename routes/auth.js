const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth/index')
const validate = require('../controllers/auth/validate')
const trimRequest = require('trim-request')
require('../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
/* Register a new users. */
router.post(
  '/register',
  trimRequest.all,
  validate.register,
  controller.register
);

/*
 * Verify route
 */
router.post('/verify', trimRequest.all, validate.verify, controller.verify)

/*
 * Forgot password route
 */
router.post(
  '/forgot',
  trimRequest.all,
  validate.forgotPassword,
  controller.forgotPassword
)

/*
 * Reset password route
 */
router.post(
  '/reset',
  trimRequest.all,
  validate.resetPassword,
  controller.resetPassword
)

/*
 * Get new refresh token
 */
router.get(
  '/token',
  requireAuth,
  controller.roleAuthorization(['user', 'admin']),
  trimRequest.all,
  controller.getRefreshToken
)

/*
 * Login route
 */
router.post('/login', trimRequest.all, validate.login, controller.login)

module.exports = router;
