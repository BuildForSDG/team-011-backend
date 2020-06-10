const express = require("express");
const multer = require("multer");
const createHttpError = require("http-errors");
const { celebrate, Segments } = require("celebrate");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const User = require("../controllers/user.controller");
const LandCtrl = require("../controllers/land.controller");
const roleMiddleware = require("../middlewares/role.middleware");
const { UserRole } = require("../models/user.model");
const { landUpdateDtoSchema } = require("../validations/land.schema");

const router = express.Router();

const upload = multer({
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      cb(createHttpError(createHttpError.BadRequest(), "Only .png, .jpg and .jpeg format allowed!"));
    }
  }
});

const updateUserDto = Joi.object({
  firstName: Joi.string().trim().max(64).required(),
  lastName: Joi.string().trim().max(64).required(),
  postalCode: Joi.string().max(12).regex(/^\d+$/).error(new Error("postal code must be digits only")),
  city: Joi.string().trim().max(64).required(),
  country: Joi.string().trim().max(64).required(),
  phoneNumber: Joi.string().trim().max(32).required(),
  description: Joi.string().trim().max(255).required(),
  address: Joi.string().trim().max(255).required(),
  profileImage: Joi.any()
}).unknown(false);

// INDEX
router.get("/", User.grantAccess("readAny", "profile"), User.index);

// STORE
router.post("/", upload.single("profileImage"), celebrate({ [Segments.BODY]: updateUserDto }), User.store);

// SHOW
router.get("/:id", User.show);

// Landowner Land Operations
router.get("/:landownerId/lands", LandCtrl.getAllLandownerLands);
router.get("/:landownerId/lands/:landId", LandCtrl.getOneLand);

router.put(
  "/:landownerId/lands/:landId",
  upload.single("photo"),
  celebrate({ [Segments.BODY]: landUpdateDtoSchema }),
  roleMiddleware({ userIdParam: "landownerId", allowedRoles: [UserRole.Landowner] }),
  LandCtrl.modifyLandDetail
);
router.delete(
  "/:landownerId/lands/:landId",
  roleMiddleware({ userIdParam: "landownerId", allowedRoles: [UserRole.Landowner] }),
  LandCtrl.deleteLandDetail
);

// UPDATE
router.put(
  "/:id",
  upload.single("profileImage"),
  celebrate({ [Segments.BODY]: updateUserDto }),
  User.grantAccess("updateOwn", "profile"),
  User.update
);

// DELETE
router.delete("/:id", User.grantAccess("deleteOwn", "profile"), User.destroy);

module.exports = router;
