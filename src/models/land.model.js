/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const Currency = {
  NGN: 'NGN',
  USD: 'USD',
  EUR: 'EUR'
};

const landSchema = mongoose.Schema({
  titleOfLand: { type: String, required: true },
  descriptionOfLand: { type: String, required: true },
  imageUrl: { type: String },
  locationOfLand: { type: String, required: true },
  userId: { type: String, required: true },
  priceOfLand: { type: Number, required: true },
  auctionType: { type: String, required: true },
  currency: { type: Currency, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = {
  Land: mongoose.model('Land', landSchema),
  Currency
};
