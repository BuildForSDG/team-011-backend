const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const landReqDtoSchema = Joi.object({
  landId: Joi.objectId().required(),
  landownerId: Joi.objectId().required()
}).unknown(false);

module.exports = { landReqDtoSchema };
