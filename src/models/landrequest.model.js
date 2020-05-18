/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const landRequestSchema = mongoose.Schema(
  {
    landId: { type: String, required: true },
    status: { type: Boolean, required: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);
const LandRequest = mongoose.model('LandRequests', landRequestSchema);
module.exports = {
  LandRequest
};
