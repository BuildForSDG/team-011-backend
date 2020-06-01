const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { AuctionType, InstallmentType } = require('../models/land.model');

const landDtoSchema = Joi.object({
  description: Joi.string().max(128),
  acres: Joi.number().greater(0).required(),
  status: Joi.boolean().default(true),
  shortLocation: Joi.string().max(32).required(),
  fullLocation: Joi.string().max(512).required(),
  price: Joi.number().greater(0).required(),
  auctionType: Joi.string().valid(...Object.keys(AuctionType)),
  installmentType: Joi.string().valid(...Object.keys(InstallmentType)),
  photo: Joi.any()
}).unknown(false);

const landUpdateDtoSchema = landDtoSchema.keys({ id: Joi.objectId().required() });
module.exports = { landDtoSchema, landUpdateDtoSchema };
