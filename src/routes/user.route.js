const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');
const createHttpError = require('http-errors');
const { celebrate, Segments } = require('celebrate');

const User = require('../controllers/user.controller');
const LandCtrl = require('../controllers/land.controller');
const validate = require('../middlewares/validate');
const LandRequest = require('../controllers/landrequest.controller');
const roleMiddleware = require('../middlewares/role.middleware');
const { UserRole } = require('../models/user.model');
const { landUpdateDtoSchema } = require('../validations/land.schema');

const router = express.Router();

const upload = multer({
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
      cb(createHttpError(createHttpError.BadRequest(), 'Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});
// INDEX
router.get('/', User.grantAccess('readAny', 'profile'), User.index);

// STORE
router.post(
  '/',
  [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('firstName').not().isEmpty().withMessage('You first name is required'),
    check('lastName').not().isEmpty().withMessage('You last name is required'),
    check('role').not().isEmpty().withMessage('Please select a role')
  ],
  validate,
  User.store
);

// SHOW
router.get('/:id', User.show);

// Landowner Land Operations
router.get('/:landownerId/lands', LandCtrl.getAllLandownerLands);
router.get('/:landownerId/lands/:landId', LandCtrl.getOneLand);

router.put(
  '/:landownerId/lands/:landId',
  upload.single('photo'),
  celebrate({ [Segments.BODY]: landUpdateDtoSchema }),
  roleMiddleware({ userIdParam: 'landownerId', allowedRoles: [UserRole.Landowner] }),
  LandCtrl.modifyLandDetail
);
router.delete(
  '/:landownerId/lands/:landId',
  roleMiddleware({ userIdParam: 'landownerId', allowedRoles: [UserRole.Landowner] }),
  LandCtrl.deleteLandDetail
);

// UPDATE
router.put('/:id', User.grantAccess('updateAny', 'profile'), upload.single('profileImage'), User.update);

// DELETE
router.delete('/:id', User.grantAccess('deleteAny', 'profile'), User.destroy);

module.exports = router;
