/* eslint-disable max-len */
const httpStatus = require('http-status-codes');
const { Land } = require('../models/land.model');
const { uploadImgAndReturnUrl } = require('../utils/index');

/**
 *CREATE A NEW LAND TOO BE LEASED OUT OR RENTED OUT
 *@route POST api/land
 *@desc Add a New Land Properety to be bidded for or sold to farmers
 *@access Private
 */
exports.createLand = async (req, res) => {
  try {
    const photoUrl = await uploadImgAndReturnUrl(req.file);
    const { id } = req.user;
    const land = new Land({
      createdBy: id,
      photoUrl: photoUrl.url,
      ...req.body
    });

    const newLand = await land.save();

    return res.status(httpStatus.CREATED).json(newLand);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'An error has occurred, please check the error message for details',
      message: error.message
    });
  }
};

/**
 * @route GET api/land/{id}
 * @desc Get the details of a particular land
 * @access Public
 */
exports.getOneLand = async (req, res) => {
  try {
    const land = await Land.findOne({
      _id: req.params.id
    });
    return res.status(200).json({ message: land });
  } catch (error) {
    return res.status(404).json({
      status: 'Error, an error has occurred, please check the error message for details',
      message: error.message
    });
  }
};

/**
 * @route PUT api/land/{id}
 * @desc Modify or Update Land details
 * @access Public
 */
exports.modifyLandDetail = async (req, res) => {
  try {
    const update = req.body;
    const { id } = req.params;

    const land = await Land.findOneAndUpdate(id, { $set: update }, { new: true, useFindAndModify: false });

    // if there is no image, return success message
    if (!req.file) {
      return res.status(200).json({ land, message: 'Land details has been updated' });
    }

    // Attempt to upload to cloudinary
    const result = await uploadImgAndReturnUrl(req);
    const landDetails = await Land.findOneAndUpdate(id, { $set: { photoUrl: result.url } }, { new: true });
    // console.log(landDetails);

    return res.status(200).json({ land: landDetails, message: 'Land details has been updated' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route DELETE api/land/{id}
 * @desc Delete  Land Detail
 *  @access Public
 */
exports.deleteLandDetail = async (req, res) => {
  try {
    const { id } = req.params;

    await Land.findOneAndDelete(id);
    return res.status(200).json({ message: 'Land Property has been removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route GET api/land/
 * @desc All Available Land
 *  @access Public
 */
exports.getAllLand = async (_req, res) => {
  try {
    const lands = await Land.find();
    return res.status(200).json({
      message: 'Success',
      lands
    });
  } catch (error) {
    return res.status(400).json({
      status: 'Error, an error has occurred, please check the error message for details',
      message: error.message
    });
  }
};


/**
 * @route GET api/land/landowner
 * @desc All LandOwners Land
 *  @access Public
 */
exports.getAllLandOwnerLand = async (_req, res) => {
  try {
    const lands = await Land.find({
      createdBy: _req.params.id
    });
    return res.status(200).json({
      message: 'Success',
      lands
    });
  } catch (error) {
    return res.status(400).json({
      status: 'Error, an error has occurred, please check the error message for details',
      message: error.message
    });
  }
};
