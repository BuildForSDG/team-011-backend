/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const mongoose = require("mongoose");

const notificationSchema = mongoose
  .Schema(
    {
      title: { type: String, required: true },
      to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
      },
      metadata: {},
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    },
    { timestamps: true }
  )
  .set("toJSON", {
    transform(doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  });
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
