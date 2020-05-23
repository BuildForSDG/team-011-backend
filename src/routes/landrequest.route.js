const express = require('express');

// const { celebrate, Segments } = require('celebrate');


const router = express.Router();

const roleMiddleware = require('../middlewares/role.middleware');
const LandRequest = require('../controllers/landrequest.controller');
const { UserRole } = require('../models/user.model');

router.post(
  '/',
  // roleMiddleware(UserRole.Admin, UserRole.Landowner),
  LandRequest.createLandRequest
);

router.get('/', LandRequest.getAllLandRequests);
router.get('/:id', LandRequest.getOneLandRequest);
router.get('/landowner/:id', LandRequest.getAllFarmerLandRequests);

router.put(
  '/:id',
  roleMiddleware(UserRole.Admin, UserRole.Landowner),
  LandRequest.modifyLandRequest
);

router.delete('/:id', LandRequest.deleteLandRequest);

module.exports = router;
