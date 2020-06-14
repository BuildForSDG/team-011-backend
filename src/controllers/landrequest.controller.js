/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable max-len */
const httpStatus = require("http-status-codes");
const { LandRequest } = require("../models/landrequest.model");
const { Land, LandStatus } = require("../models/land.model");
const { Notification } = require("../models/notification.model");

/**
 *CREATE A NEW LAND TOO BE LEASED OUT OR RENTED OUT
 *@route POST api/land
 *@desc Add a New Land Property to be bidden for or sold to farmers
 *@access Private
 */
// eslint-disable-next-line complexity
exports.createLandRequest = async (req, res) => {
  try {
    const { landId } = req.body;

    const land = await Land.findOne({ _id: landId });
    if (!land) return res.status(httpStatus.NOT_FOUND).json({ message: "Land your making request to does not exist" });
    const request = await LandRequest.findOne({ landId, createdBy: req.user.id });
    if (request) return res.status(httpStatus.CONFLICT).json({ message: "Request already received" });
    const landRequest = new LandRequest({
      createdBy: req.user.id,
      landownerId: land.createdBy,
      landId
    });
    const savedRequest = await landRequest.save();
    if (land.requests.indexOf(savedRequest.id) < 0) land.requests.push(savedRequest.id);
    await land.save();
    const { _id, createdBy } = savedRequest;
    return res.status(httpStatus.CREATED).json({ id: _id, createdBy });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error has occurred"
    });
  }
};

/**
 * @route GET api/land/{id}
 * @desc Get the details of a particular land
 * @access Public
 */
exports.getOneFarmerLandRequest = async (req, res) => {
  try {
    const landRequest = await LandRequest.findOne({
      _id: req.params.id
    })
      .populate("landId", "price shortLocation status", null, { sort: { createdAt: -1 } })
      .populate("createdBy", "firstName lastName", null, { sort: { createdAt: -1 } });
    return res.status(httpStatus.OK).json({ message: landRequest });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error has occurred"
    });
  }
};

/**
 * @route PUT api/land/{id}
 * @desc Modify or Update Land Request
 * @access Public
 */
exports.modifyLandRequest = async (req, res) => {
  try {
    const update = req.body;
    const { request_id } = req.params;

    const landRequest = await LandRequest.findOneAndUpdate(
      { _id: request_id },
      { $set: { ...update, updatedBy: req.user.id } },
      { new: true, useFindAndModify: false }
    )
      .populate("landId", "price shortLocation status")
      .populate("landownerId", "firstName");
    const land = await Land.findOneAndUpdate(
      { _id: landRequest.landId },
      { $set: { status: LandStatus.PENDING_PAYMENT } },
      { new: true, useFindAndModify: false }
    );
    landRequest.landId.status = land.status;

    const notification = new Notification({
      to: landRequest.createdBy,
      title: "land-request-approved",
      metadata: {
        message: `${landRequest.landownerId.firstName} approved your request`,
        at: landRequest.updatedAt
      },
      createdBy: req.user.id
    });
    await notification.save();
    const { io } = req.app;
    if (io) io.emit("notification", notification);
    return res.status(httpStatus.OK).json({ ...landRequest.toJSON() });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error has occurred"
    });
  }
};

/**
 * @route DELETE api/land/{id}
 * @desc Delete  Land Request
 *  @access Public
 */
exports.deleteFarmerLandRequest = async (req, res) => {
  try {
    const { request_id } = req.params;
    const landReq = await LandRequest.findOneAndDelete({ _id: request_id });

    const land = await Land.findOne({ _id: landReq.landId });
    const removeIndex = land.requests.indexOf(landReq.id);
    land.requests.splice(removeIndex, 1);
    await land.save();
    return res.status(httpStatus.OK).json({ message: "Land Property has been removed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error has occurred"
    });
  }
};

/**
 * @route GET api/land/
 * @desc All Available Land
 *  @access Public
 */
exports.getAllLandRequests = async (_req, res) => {
  try {
    const landRequests = await LandRequest.find()
      .populate("landId", "price shortLocation status", null, { sort: { createdAt: -1 } })
      .populate("createdBy", "firstName lastName", null, { sort: { createdAt: -1 } });

    return res.status(httpStatus.OK).json({
      message: "Success",
      landRequests
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error has occurred"
    });
  }
};
exports.getLandLandRequests = async (req, res) => {
  try {
    const { landId } = req.params;
    const { query, opts } = req.query;

    const landRequests = await LandRequest.find({ ...JSON.parse(query), landId }, null, JSON.parse(opts))
      .populate("landId", "price shortLocation status", null, { sort: { createdAt: -1 } })
      .populate("createdBy", "firstName lastName", null, { sort: { createdAt: -1 } });
    const totalCount = await LandRequest.find({ landId }).countDocuments().exec();

    return res.status(httpStatus.OK).json({
      totalCount,
      items: landRequests
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error has occurred"
    });
  }
};
/**
 * @route GET api/:landId/landRequests
 * @desc All Request of a Land
 *  @access Public
 */
exports.getAllLandownerLandRequests = async (req, res) => {
  try {
    const { query, opts } = req.query;
    const { id: landownerId } = req.user;
    const condition = { ...JSON.parse(query || "{}"), landownerId };
    const options = JSON.parse(opts || "{}");

    const landRequests = await LandRequest.find(condition, null, options)
      .populate("landId", "price shortLocation status", null, { sort: { createdAt: -1 } })
      .populate("createdBy", "firstName lastName", null, { sort: { createdAt: -1 } });
    const totalCount = await LandRequest.find({ landownerId }).countDocuments().exec();

    return res.status(httpStatus.OK).json({
      totalCount,
      items: landRequests
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error has occurred"
    });
  }
};

/**
 * @route GET api/land/landowner
 * @desc All LandOwners Land
 *  @access Public
 */
exports.getAllFarmerLandRequests = async (req, res) => {
  try {
    const { query, opts } = req.query;
    const condition = {
      ...JSON.parse(query || "{}"),
      createdBy: req.user.id
    };
    const landRequests = await LandRequest.find(condition, null, JSON.parse(opts || "{}"))
      .populate({ path: "landId", select: "-requests -__v" })
      .populate({ path: "landownerId", select: "firstName lastName" })
      .populate({ path: "createdBy", select: "firstName lastName" });
    return res.status(httpStatus.OK).json({
      totalCount: landRequests.length,
      items: landRequests
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error has occurred"
    });
  }
};
