const express = require("express");
const { celebrate, Segments } = require("celebrate");

const router = express.Router();

const roleMiddleware = require("../middlewares/role.middleware");
const LandRequest = require("../controllers/landrequest.controller");
const { UserRole } = require("../models/user.model");
const { landReqDtoSchema, updateReqDtoSchema } = require("../validations/land_request.schema");

// Only farmers should be able to make a land-request
router.post(
  "/",
  roleMiddleware({ allowedRoles: [UserRole.Farmer] }),
  celebrate({ [Segments.BODY]: landReqDtoSchema }),
  LandRequest.createLandRequest
);

// Farmer land request operations
router.get(
  "/farmer_land_requests",
  roleMiddleware({ allowedRoles: [UserRole.Farmer] }),
  LandRequest.getAllFarmerLandRequests
);
router.get(
  "/farmer_land_requests/:request_id",
  roleMiddleware({ allowedRoles: [UserRole.Farmer] }),
  LandRequest.getOneFarmerLandRequest
);
router.delete(
  "/farmer_land_requests/:request_id",
  roleMiddleware({ allowedRoles: [UserRole.Farmer] }),
  LandRequest.deleteFarmerLandRequest
);

// Landowner land-request operations
router.get(
  "/requests_to_landowner",
  roleMiddleware({ allowedRoles: [UserRole.Landowner] }),
  LandRequest.getAllLandownerLandRequests
);
router.get(
  "/requests_to_landowner/:request_id",
  roleMiddleware({ allowedRoles: [UserRole.Landowner] }),
  LandRequest.getOneFarmerLandRequest
);
router.put(
  "/requests_to_landowner/:request_id",
  roleMiddleware({ allowedRoles: [UserRole.Landowner] }),
  celebrate({ [Segments.BODY]: updateReqDtoSchema }),
  LandRequest.modifyLandRequest
);
// Strictly admin operations on land-requests
router.get("/land_requests", roleMiddleware({ allowedRoles: [UserRole.Admin] }), LandRequest.getAllLandRequests);
router.get(
  "/land_requests/:id",
  roleMiddleware({ allowedRoles: [UserRole.Admin] }),
  LandRequest.getOneFarmerLandRequest
);
router.put(
  "/land_requests/:request_id",
  roleMiddleware({ allowedRoles: [UserRole.Admin] }),
  celebrate({ [Segments.BODY]: updateReqDtoSchema }),
  LandRequest.modifyLandRequest
);
router.delete(
  "/land_requests/:request_id",
  roleMiddleware({ allowedRoles: [UserRole.Admin] }),
  LandRequest.deleteFarmerLandRequest
);

module.exports = router;
