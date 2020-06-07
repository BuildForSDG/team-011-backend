const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { LandRequestStatus } = require('../models/landrequest.model');

const landReqDtoSchema = Joi.object({
  landId: Joi.objectId().required()
}).unknown(false);
const updateReqDtoSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.keys(LandRequestStatus))
    .default(LandRequestStatus.PENDING)
}).unknown(false);
module.exports = { landReqDtoSchema, updateReqDtoSchema };
