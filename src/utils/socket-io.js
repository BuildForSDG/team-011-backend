/* eslint-disable no-console */
const { LandRequest } = require("../models/landrequest.model");
const { Payment } = require("../models/payment.model");

module.exports = {
  onConnect: (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => console.log("user disconnected"));
    LandRequest.watch().on("change", (data) => {
      socket.emit("request-notification", data);
    });
    // Payment.watch().on("change", (data) => {
    //   socket.emit("payment-notification", data);
    // });
  }
};
