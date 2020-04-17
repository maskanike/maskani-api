const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth/index')
const validate = require('../controllers/auth/validate')
const trimRequest = require('trim-request')

/* Register a new users. */
router.post(
  '/register',
  trimRequest.all,
  validate.register,
  controller.register
);

module.exports = router;
