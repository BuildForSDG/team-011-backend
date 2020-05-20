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

    const newLandRequest = await landRequest.save();

    return res.status(httpStatus.CREATED).json(newLandRequest);
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
exports.getOneLandRequest = async (req, res) => {
  try {
    const landRequest = await LandRequest.findOne({
      _id: req.params.id
    });
    return res.status(200).json({ message: landRequest });
  } catch (error) {
    return res.status(404).json({
      status: 'Error, an error has occurred, please check the error message for details',
      message: error.message
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

    const landRequest = await LandRequest.findOneAndUpdate(id, { $set: update }, { new: true, useFindAndModify: false });

    return res.status(200).json({ landRequest, message: 'LandRequest details has been updated' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
exports.getAllLandRequests = async (_req, res) => {
  try {
    const landRequests = await LandRequest.find();
    return res.status(200).json({
      message: 'Success',
      landRequests
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
exports.getAllFarmerLandRequests = async (_req, res) => {
  try {
    const landRequests = await LandRequest.find({
      createdBy: _req.params.id
    });
    return res.status(200).json({
      message: 'Success',
      landRequests
    });
  } catch (error) {
    return res.status(400).json({
      status: 'Error, an error has occurred, please check the error message for details',
      message: error.message
    });
  }
};
