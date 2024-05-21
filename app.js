const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const authRoutes = require("./routes/auth");
const friendRoutes = require("./routes/friend");
const messageRoutes = require("./routes/message");
const conversationRoutes = require("./routes/conversation");

const app = express();

app.use(bodyParser.json()); // application/json
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
// );
// app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

let cors = require("cors");
app.use(cors());

app.use("/auth", authRoutes);
app.use("/friend", friendRoutes);
app.use("/message", messageRoutes);
app.use("/conversation", conversationRoutes);
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://soleil:01636878201@cluster0.4x48u.mongodb.net/chatapp2?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((result) => {
    const server = app.listen(8000);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      socket.on("disconnect", () => {
        const userId = socket.userId;
      });

      socket.on("join", (userId) => {
        socket.userId = userId;
        socket.join(userId);
      });

      socket.on("join-conversations", (conversationIds) => {
        console.log("join conversations" + conversationIds);
        conversationIds.forEach((id) => socket.join(id));
      });

      socket.on("join-conversation", (conversationId) => {
        console.log("join conversation" + conversationId);
        socket.join(conversationId);
      });

      socket.on("leave-conversation", (conversationId) => {
        console.log("leave group");
        socket.leave(conversationId);
      });
      // socket.on("send-message", (data) => {
      //   console.log("data to client", data);
      //   io.emit("received-message", data);
      // })
    });
  })
  .catch((err) => console.log(err));
