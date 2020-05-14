const Joi = require('@hapi/joi');
const { AuctionType, Currency, InstallmentType } = require('../models/land.model');

const landDtoSchema = Joi.object({
  title: Joi.string().max(32).trim().required(),
  description: Joi.string().max(32),
  acres: Joi.number().greater(0).required(),
  shortLocation: Joi.string().max(64).required(),
  fullLocation: Joi.string().max(64).required(),
  price: Joi.number().greater(0).required(),
  auctionType: Joi.string().valid(...Object.keys(AuctionType)),
  installmentType: Joi.string().valid(...Object.keys(InstallmentType)),
  currency: Joi.string().valid(...Object.keys(Currency)),
  landPhoto: Joi.any()
}).unknown(false);
module.exports = { landDtoSchema };
