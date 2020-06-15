/* eslint-disable no-console */
const socketIo = require("socket.io");
const app = require("./app.js");

const server = app.listen(process.env.PORT || 1234, () => {
  console.log("App running on port", server.address().port);
});
const io = socketIo.listen(server);
io.on("connect", (socket) => {
  console.log("a user connected");
  app.socket = socket;
  socket.on("disconnect", () => console.log("user disconnected"));
});
app.io = io;
