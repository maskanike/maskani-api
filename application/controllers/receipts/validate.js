const { validationResult } = require('../../middleware/utils')
const { check } = require('express-validator')

/**
 * Validates create new item request
 */
exports.sendItem = [
  check('amount')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isNumeric()
    .withMessage('AMOUNT_IS_NOT_VALID'),
  check('TenantId')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isNumeric()
    .withMessage('TENANT_ID_IS_NOT_VALID'),
  check('InvoiceId')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isNumeric()
    .withMessage('INVOICE_ID_IS_NOT_VALID'),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]

/**
 * Validates get item request
 */
exports.getItem = [
  check('id')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]
