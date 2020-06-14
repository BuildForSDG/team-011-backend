const express = require("express");

const NotifyCtrl = require("../controllers/notification.controller");

const router = express.Router();

router.get("/", NotifyCtrl.getAll);
router.delete("/", NotifyCtrl.delete);

exports.NotificationRoutes = router;
