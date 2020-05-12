const express = require('express');
const multer = require('multer');
const { check } = require('express-validator');

const router = express.Router();

const validate = require('../middlewares/validate');
const Land = require('../controllers/land.controller');

const upload = multer().single('imageUrl');

router.post(
  '/',
  // [
  //   check('userId').not().isEmpty().withMessage('User-id is reqired.'),

  //   check('titleOfLand').not().isEmpty().withMessage('Please provide the title of the Land!'),

  //   check('descriptionOfLand')
  //     .not()
  //     .isEmpty()
  //     .withMessage('Please give a brief description of the Land')
  //     .isLength({ min: 4, max: 30 })
  //     .withMessage('The description should be brief'),

  //   check('imageUrl').not().isEmpty().withMessage('Please upload an image of the land, in JPG or PNG format'),

  //   check('currency')
  //     .not()
  //     .isEmpty()
  //     .withMessage('Please upload an image of the land, in JPG or PNG format')
  //     .isCurrency(),

  //   check('locationOfLand').not().isEmpty().withMessage('Please upload an image of the land, in JPG or PNG format'),

  //   check('auctionType').not().isEmpty().withMessage('Please select if you want to rent or lease it out'),

  //   check('priceOfLand').not().isEmpty().withMessage('')
  //     .isNumeric()
  // ],
  validate,
  upload,
  Land.createLand
);

// router.post('/', validate, upload, Land.getAllLand);
router.get('/', validate, Land.getAllLand);
router.get('/:id', validate, Land.getOneLand);


router.put('/:id', upload, Land.modifyLandDetail);

router.delete('/:id', validate, Land.deleteLandDetail);

module.exports = router;
