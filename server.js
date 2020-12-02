const express = require("express");
const app = express();

const port = 4000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

io.on("error", (e) => console.log(e));

let broadcaster;

io.on("connection", (socket) => {
  console.log("a user connected", socket.id, broadcaster);

  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });

  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });

  socket.on("offer", (id, remoteDescription) => {
    socket.to(id).emit("offer", broadcaster, remoteDescription);
  });

  socket.on("answer", (remoteDescription) => {
    socket.to(broadcaster).emit("answer", socket.id, remoteDescription);
  });

  socket.on("candidate", (id, candidate) => {
    socket.to(id).emit("candidate", socket.id, candidate);
  });

  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});

server.listen(port, () => console.log("Server is running on port " + port));
