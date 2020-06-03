const express = require('express');
const { celebrate, Segments } = require('celebrate');

const router = express.Router();

const roleMiddleware = require('../middlewares/role.middleware');
const LandRequest = require('../controllers/landrequest.controller');
const { UserRole } = require('../models/user.model');
const { landReqDtoSchema } = require('../validations/land_request.schema');

// Only farmers should be able to make a land-request
router.post(
  '/',
  roleMiddleware({ allowedRoles: [UserRole.Farmer] }),
  celebrate({ [Segments.BODY]: landReqDtoSchema }),
  LandRequest.createLandRequest
);

// Strictly admin operations on land-requests
router.get('/', roleMiddleware({ allowedRoles: UserRole.Admin }), LandRequest.getAllLandRequests);
router.get('/:id', roleMiddleware({ allowedRoles: UserRole.Admin }), LandRequest.getOneLandRequest);
router.put('/:id', roleMiddleware({ allowedRoles: UserRole.Admin }), LandRequest.modifyLandRequest);
router.delete('/:id', roleMiddleware({ allowedRoles: UserRole.Admin }), LandRequest.deleteLandRequest);

module.exports = router;
