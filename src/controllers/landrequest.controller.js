/* eslint-disable no-console */
/* eslint-disable max-len */
const httpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const { LandRequest } = require('../models/landrequest.model');
const { Land } = require('../models/land.model');

/**
 *CREATE A NEW LAND TOO BE LEASED OUT OR RENTED OUT
 *@route POST api/land
 *@desc Add a New Land Properety to be bidded for or sold to farmers
 *@access Private
 */
exports.createLandRequest = async (req, res) => {
  try {
    const { id } = req.user;
    const { landId, landownerId } = req.body;

    const land = await Land.findOne({ _id: landId, createdBy: landownerId });
    if (!land) return res.status(httpStatus.NOT_FOUND).json({ message: 'Land your making request to does not exist' });
    const landRequest = new LandRequest({
      createdBy: id,
      ...req.body
    });
    const savedRequest = await landRequest.save();
    land.requests.push(savedRequest.id);
    await land.save();
    const { _id, createdBy } = savedRequest;
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

    const landReq = await LandRequest.findOneAndDelete(id);
    const land = await Land.findOne({ _id: landReq.landId });
    const removeIndex = land.requests.indexOf(landReq.id);
    land.requests.splice(removeIndex, 1);
    await land.save();
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
exports.getLandLandRequests = async (req, res) => {
  try {
    const { landId } = req.params;
    const { query, opts } = req.query;

    const landRequests = await LandRequest.find({ ...JSON.parse(query), landId }, null, JSON.parse(opts));
    const totalCount = await LandRequest.find({ landId }).countDocuments().exec();

    return res.status(httpStatus.OK).json({
      totalCount,
      items: landRequests
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error has occurred'
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
    const condition = { ...JSON.parse(query || '{}'), landownerId };
    const options = JSON.parse(opts || '{}');
    const landRequests = await LandRequest.find(condition, null, options);
    const totalCount = await LandRequest.find({ landownerId }).countDocuments().exec();

    return res.status(httpStatus.OK).json({
      totalCount,
      items: landRequests
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
exports.getAllFarmerLandRequests = async (req, res) => {
  try {
    const landRequests = await LandRequest.find({
      createdBy: req.params.id
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
