/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },

    token: {
      type: String,
      required: true
    },

    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 43200
    }
  },
  { timestamps: true }
).set("toJSON", {
  transform(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model("Tokens", tokenSchema);
