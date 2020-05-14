/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const Currency = {
  NGN: 'NGN',
  USD: 'USD',
  EUR: 'EUR'
};
const AuctionType = {
  Lease: 'Lease',
  Rent: 'Rent'
};
const InstallmentType = {
  Biannual: 'Biannual',
  Annual: 'Annual',
  Monthly: 'Monthly',
  Weekly: 'Weekly',
  Daily: 'Daily'
};
const landSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    photoUrl: { type: String },
    shortLocation: { type: String, required: true },
    fullLocation: { type: String, required: true },
    acres: { type: Number, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    price: { type: Number, required: true },
    auctionType: { type: AuctionType, required: true },
    installmentType: { type: InstallmentType, required: true },
    currency: { type: Currency, required: true }
  },
  { timestamps: true }
);
const Land = mongoose.model('Lands', landSchema);
module.exports = {
  Land,
  Currency,
  AuctionType,
  InstallmentType
};
