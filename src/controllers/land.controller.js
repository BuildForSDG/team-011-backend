/* eslint-disable no-console */
/* eslint-disable max-len */
const httpStatus = require('http-status-codes');
const { Land } = require('../models/land.model');
const { LandRequest } = require('../models/landrequest.model');

const { uploadImgAndReturnUrl } = require('../utils/index');
/**
 *CREATE A NEW LAND TOO BE LEASED OUT OR RENTED OUT
 *@route POST api/lands
 *@desc Add a New Land Property to be bided for or sold to farmers
 *@access Private
 */
exports.createLand = async (req, res) => {
  try {
    const photo = req.file && (await uploadImgAndReturnUrl(req.file));
    const { id } = req.user;
    const photoUrl = (photo && photo.secure_url) || undefined;
    const land = new Land({
      createdBy: id,
      ...req.body
    });
    land.photo = photoUrl;

    await land.save();

    return res.status(httpStatus.CREATED).json({ ...land.toJSON() });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
    });
  }
};

/**
 * @route PUT api/lands/{id}
 * @desc Modify or Update Land details
 * @access Public
 */
exports.modifyLandDetail = async (req, res) => {
  try {
    const photo = req.file && (await uploadImgAndReturnUrl(req.file));
    const update = req.body;
    if (req.file) update.photo = photo.secure_url;
    else delete update.photo;

    const { landId } = req.params;
    const land = await Land.findOneAndUpdate(
      { _id: landId },
      { $set: update, updatedBy: req.user.id },
      { new: true, useFindAndModify: false }
    ).exec();

    return res.status(httpStatus.OK).json({ ...land.toJSON() });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
    });
  }
};

/**
 * @route GET api/lands/{id}
 * @desc Get the details of a particular land
 * @access Public
 */
exports.getOneLand = async (req, res) => {
  try {
    const land = await Land.findOne({
      _id: req.params.id
    });
    return res.status(httpStatus.OK).json({ ...land.toJSON() });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
    });
  }
};

/**
 * @route DELETE api/lands/{id}
 * @desc Delete  Land Detail
 *  @access Public
 */
exports.deleteLandDetail = async (req, res) => {
  try {
    const { landId } = req.params;
    console.log(landId);
    await Land.findOneAndDelete({ _id: landId });
    await LandRequest.findOneAndDelete({ landId });
    return res.status(httpStatus.OK).json({ message: 'Land Property has been removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
    });
  }
};

/**
 * @route GET api/lands/
 * @desc All Available Land
 *  @access Public
 */
exports.getAllLand = async (req, res) => {
  try {
    const { query, opts, countQuery } = req.query;
    console.log('getAllLand', req.query);
    const lands = await Land.find(JSON.parse(query), null, JSON.parse(opts)).populate({
      path: 'requests',
      select: 'createdBy updatedAt createdAt status'
    });
    const totalCount = await Land.find(JSON.parse(countQuery || '{}'))
      .countDocuments()
      .exec();
    return res.status(httpStatus.OK).json({ totalCount, items: lands });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Error, an error has occurred, please check the error message for details'
    });
  }
};

/**
 * @route GET api/lands/landowner
 * @desc All LandOwners Land
 *  @access Public
 */
exports.getAllLandownerLands = async (req, res) => {
  try {
    const { query, opts } = req.query;
    console.log(req.query);
    const lands = await Land.find(JSON.parse(query), null, JSON.parse(opts)).where('createdBy', req.user.id);
    const totalCount = await Land.countDocuments({ createdBy: req.user.id }).exec();
    return res.status(httpStatus.OK).json({ totalCount, items: lands });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Error, an error has occurred, please check the error message for details'
    });
  }
};
