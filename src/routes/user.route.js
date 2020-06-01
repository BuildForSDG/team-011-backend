const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');

const User = require('../controllers/user.controller');
const LandCtrl = require('../controllers/land.controller');
const validate = require('../middlewares/validate');
const LandRequest = require('../controllers/landrequest.controller');
const roleMiddleware = require('../middlewares/role.middleware');
const { UserRole } = require('../models/user.model');

const router = express.Router();

const upload = multer().single('profileImage');

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
router.get('/:id/lands', LandCtrl.getAllLandOwnerLand);
router.get('/:id/lands/:id', LandRequest.getOneLandRequest);

router.put('/:id/lands/:id', roleMiddleware(UserRole.Landowner), LandRequest.modifyLandRequest);
router.delete('/:id/lands/:id', roleMiddleware(UserRole.Landowner), LandRequest.deleteLandRequest);

// Farmer land-request operations
router.get('/:id/land_requests', roleMiddleware(UserRole.Farmer), LandRequest.getAllFarmerLandRequests);
router.get('/:id/land_requests/:id', roleMiddleware(UserRole.Farmer), LandRequest.getOneLandRequest);

router.put('/:id/land_requests/:id', roleMiddleware(UserRole.Farmer), LandRequest.modifyLandRequest);
router.delete('/:id/land_requests/:id', roleMiddleware(UserRole.Farmer), LandRequest.deleteLandRequest);

// UPDATE
router.put('/:id', User.grantAccess('updateAny', 'profile'), upload, User.update);

// DELETE
router.delete('/:id', User.grantAccess('deleteAny', 'profile'), User.destroy);

module.exports = router;
