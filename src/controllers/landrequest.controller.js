/* eslint-disable no-console */
/* eslint-disable max-len */
const httpStatus = require('http-status-codes');
const { LandRequest } = require('../models/landrequest.model');

/**
 *CREATE A NEW LAND TOO BE LEASED OUT OR RENTED OUT
 *@route POST api/land
 *@desc Add a New Land Properety to be bidded for or sold to farmers
 *@access Private
 */
exports.createLandRequest = async (req, res) => {
  try {
    const { id } = req.user;
    const landRequest = new LandRequest({
      createdBy: id,
      ...req.body
    });
    const { _id, createdBy } = await landRequest.save();

    return res.status(httpStatus.CREATED).json({ id: _id, createdBy });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
    });
  }
};

/**
 * @route GET api/land/{id}
 * @desc Get the details of a particular land
 * @access Public
 */
exports.getOneLandRequest = async (req, res) => {
  try {
    const landRequest = await LandRequest.findOne({
      _id: req.params.id
    });
    return res.status(httpStatus.OK).json({ message: landRequest });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
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
    const { id } = req.params;

    const landRequest = await LandRequest.findOneAndUpdate(
      id,
      { $set: update },
      { new: true, useFindAndModify: false }
    );

    return res.status(httpStatus.OK).json({ landRequest, message: 'LandRequest details has been updated' });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
    });
  }
};

/**
 * @route DELETE api/land/{id}
 * @desc Delete  Land Request
 *  @access Public
 */
exports.deleteLandRequest = async (req, res) => {
  try {
    const { id } = req.params;

    await LandRequest.findOneAndDelete(id);
    return res.status(httpStatus.OK).json({ message: 'Land Property has been removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
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
    const landRequests = await LandRequest.find();
    return res.status(httpStatus.OK).json({
      message: 'Success',
      landRequests
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
    });
  }
};

/**
 * @route GET api/land/landowner
 * @desc All LandOwners Land
 *  @access Public
 */
exports.getAllFarmerLandRequests = async (_req, res) => {
  try {
    const landRequests = await LandRequest.find({
      createdBy: _req.params.id
    });
    return res.status(httpStatus.OK).json({
      message: 'Success',
      landRequests
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
    });
  }
};
