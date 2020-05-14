const express = require('express');
const { check } = require('express-validator');

const Auth = require('../controllers/auth.controller');
const Password = require('../controllers/password.controller');
const validate = require('../middlewares/validate');
const genericHandler = require('../middlewares/route-handler');

const router = express.Router();

router.get('/', genericHandler);

router.post(
  '/register',
  [
    check('email').isEmail().withMessage('Enter a valid email address'),
    // eslint-disable-next-line newline-per-chained-call
    check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
    check('firstName').not().isEmpty().withMessage('You first name is required'),
    check('lastName').not().isEmpty().withMessage('You last name is required'),
    check('role').not().isEmpty().withMessage('Please select a role')
  ],
  validate,
  Auth.register
);

router.post(
  '/login',
  [check('email').isEmail().withMessage('Enter a valid email address'), check('password').not().isEmpty()],
  validate,
  Auth.login
);

// EMAIL Verification
router.get('/verify/:token', Auth.verify);
router.post('/resend', Auth.resendToken);

// Password RESET
router.post(
  '/recover',
  [check('email').isEmail().withMessage('Enter a valid email address')],
  validate,
  Password.recover
);

router.get('/reset/:token', Password.reset);

router.post(
  '/reset/:token',
  [
    // eslint-disable-next-line newline-per-chained-call
    check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
    check('confirmPassword', 'Passwords do not match').custom((value, { req }) => value === req.body.password)
  ],
  validate,
  Password.resetPassword
);

module.exports = router;
