const express = require('express');
const { check } = require('express-validator');
const { celebrate, Segments } = require('celebrate');

const Joi = require('@hapi/joi');

const { UserRole } = require('../models/user.model');
const Auth = require('../controllers/auth.controller');
const Password = require('../controllers/password.controller');
const validate = require('../middlewares/validate');
const genericHandler = require('../middlewares/route-handler');

const clientUrlValidation = Joi.object({ clientUrl: Joi.string().uri() });
const loginDtoValidation = clientUrlValidation
  .keys({
    email: Joi.string().email().max(32).required(),
    password: Joi.string().min(6).required()
  })
  .unknown(false);
const registerDtoValidation = loginDtoValidation
  .keys({
    firstName: Joi.string().max(32).required(),
    lastName: Joi.string().max(32).required(),
    role: Joi.string()
      .valid(...Object.keys(UserRole))
      .required()
  })
  .unknown(false);

const router = express.Router();

router.get('/', genericHandler);

router.post('/login', celebrate({ [Segments.BODY]: loginDtoValidation }), validate, Auth.login);
router.post('/register', celebrate({ [Segments.BODY]: registerDtoValidation }), Auth.register);

// EMAIL Verification
router.get('/verify/:token', Auth.verify);
router.post('/resend', celebrate({ [Segments.BODY]: clientUrlValidation }), Auth.resendToken);

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
