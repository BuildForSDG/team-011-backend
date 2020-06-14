/* eslint-disable no-console */
const { LandRequest } = require("../models/landrequest.model");

module.exports = {
  onConnect: (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => console.log("user disconnected"));
    LandRequest.watch().on("change", (data) => {
      socket.emit("request-notification", data);
    });
  }
};
