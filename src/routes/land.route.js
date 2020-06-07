const express = require('express');
const multer = require('multer');
const createHttpError = require('http-errors');
const { celebrate, Segments } = require('celebrate');

const router = express.Router();

const roleMiddleware = require('../middlewares/role.middleware');
const Land = require('../controllers/land.controller');
const LandReqCtrl = require('../controllers/landrequest.controller');
const { UserRole } = require('../models/user.model');
const { landDtoSchema, landUpdateDtoSchema } = require('../validations/land.schema');

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

router.get('/', Land.getAllLand);
router.get('/:id', Land.getOneLand);
router.get('/:landId/landRequests', LandReqCtrl.getLandLandRequests);

router.post(
  '/',
  upload.single('photo'),
  celebrate({ [Segments.BODY]: landDtoSchema }),
  roleMiddleware({ allowedRoles: [UserRole.Admin, UserRole.Landowner] }),
  Land.createLand
);

// Only admin should be able to edit/delete ANY land
router.put(
  '/:id',
  upload.single('photo'),
  celebrate({ [Segments.BODY]: landUpdateDtoSchema }),
  roleMiddleware({ allowedRoles: [UserRole.Admin] }),
  Land.modifyLandDetail
);
router.delete('/:id', roleMiddleware(UserRole.Admin), Land.deleteLandDetail);

module.exports = router;
