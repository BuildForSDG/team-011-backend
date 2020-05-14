const express = require('express');
const multer = require('multer');
const createHttpError = require('http-errors');

const { celebrate, Segments } = require('celebrate');

// const fileUpload = require('express-fileupload');

const router = express.Router();

const roleMiddleware = require('../middlewares/role.middleware');
const Land = require('../controllers/land.controller');
const { UserRole } = require('../models/user.model');
const { landDtoSchema } = require('../validations/land.schema');

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

router.post(
  '/',
  upload.single('landPhoto'),
  roleMiddleware(UserRole.Admin, UserRole.Landowner),
  celebrate({ [Segments.BODY]: landDtoSchema }),
  Land.createLand
);

router.get('/', Land.getAllLand);
router.get('/:id', Land.getOneLand);

router.put(
  '/:id',
  roleMiddleware(UserRole.Admin, UserRole.Landowner),
  celebrate({ [Segments.BODY]: landDtoSchema }),
  Land.modifyLandDetail
);

router.delete('/:id', Land.deleteLandDetail);

module.exports = router;
