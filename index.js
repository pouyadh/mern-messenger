const {
  mongooseConfig,
  corsConfig,
  appConfig,
  socketConfig,
  tokenConfig,
} = require("./config");
const mongoose = require("mongoose");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const socket = require("socket.io");
const cookieParserIo = require("./middleware/cookie-parser-io");
const authIo = require("./middleware/auth-io");
const conversationHandlers = require("./handlers/conversationHandlers");
const colors = require("colors");
const path = require("path");

console.log(__dirname);

// Database
mongoose
  .connect(mongooseConfig.uri, mongooseConfig.options)
  .then(() => {
    console.log("Database connection OK");
  })
  .catch((error) => {
    console.log("Database connection failed. exiting now...");
    console.error(error);
    process.exit(1);
  });

// Express App
const app = express();
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

app.use("/api/user", userRoutes);
app.use("/api/conversation", auth, conversationRoutes);
app.use(express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

const server = app.listen(appConfig.port, () => {
  console.log(`Server is running on port: ${appConfig.port}`);
});

// Socket

const io = socket(server, socketConfig.options);
io.use(cookieParserIo());
io.use(authIo(tokenConfig.secret));

const { handleJoin, handleDisconnect, handleMessage } = conversationHandlers;
io.on("connection", (socket) => {
  socket.on("join", handleJoin);
  socket.on("disconnect", handleDisconnect);
  socket.on("msg", handleMessage);
});
