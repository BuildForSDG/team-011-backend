/* eslint-disable max-len */
const { Land } = require('../models/land.model');
const { uploader } = require('../utils/index');

/**
 *CREATE A NEW LAND TOO BE LEASED OUT OR RENTED OUT
 *@route POST api/land
 *@desc Add a New Land Properety to be bidded for or sold to farmers
 *@access Private
 */
exports.createLand = async (req, res) => {
  try {
    const result = await uploader(req);
    // console.log(req.body);

    const land = new Land({
      userId: req.body.userId,
      titleOfLand: req.body.titleOfLand,
      descriptionOfLand: req.body.descriptionOfLand,
      imageUrl: result.url,
      locationOfLand: req.body.locationOfLand,
      priceOfLand: req.body.priceOfLand,
      currency: req.body.currency,
      auctionType: req.body.auctionType
    });
    // console.log(land);
    const newLand = await land.save();

    return res.status(201).json({
      status: 'Success',
      message: newLand
    });
  } catch (error) {
    return res.status(201).json({
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
    const result = await uploader(req);
    const landDetails = await Land.findOneAndUpdate(id, { $set: { imageUrl: result.url } }, { new: true });
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
 * @desc All Avaialbale Land
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
