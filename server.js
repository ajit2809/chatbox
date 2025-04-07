const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const roomUsers = {};

io.on("connection", (socket) => {
  socket.on("join_room", (room) => {
    const users = roomUsers[room] || [];
    if (users.length >= 2) {
      socket.emit("room_full");
    } else {
      socket.join(room);
      roomUsers[room] = [...users, socket.id];
      socket.emit("joined");

      socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", { content: data.content });
      });

      socket.on("disconnect", () => {
        roomUsers[room] = roomUsers[room].filter((id) => id !== socket.id);
        if (roomUsers[room].length === 0) {
          delete roomUsers[room];
        }
      });
    }
  });
});

server.listen(3001, () => {
  console.log("Backend server running on http://localhost:3001");
});