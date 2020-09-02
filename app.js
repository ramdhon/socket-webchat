require("dotenv").config();

const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const log = require(__dirname + "/helpers/log");

const PORT = process.env.PORT || 80;

app.use(cors());
app.use("/webchat", express.static(path.join(__dirname, "public")));

io.on("connect", (socket) => {
  log("a user connected", socket.id);
  const event = {
    type: "event",
    user: socket.id,
    event: "connected",
    created: socket.handshake.issued
  }
  log(event);
  io.emit("message", event);

  socket.on("message", (text) => {
    const message = {
      type: "text",
      sender: socket.id,
      text,
      created: socket.handshake.issued
    }
    log(message);
    io.emit("message", message);
  })

  socket.on("typing", (event) => {
    const typing = {
      user: socket.id,
      event
    }
    log({ typing });
    socket.broadcast.emit("typing", typing);
  })

  socket.on("disconnect", () => {
    log("a user disconnected", socket.id)
    const event = {
      type: "event",
      user: socket.id,
      event: "disconnected",
      created: socket.handshake.issued
    }
    log(event);
    io.emit("message", event);
  })
})

server.listen(PORT, () => {
  log(`server run on port: ${PORT}`);
})