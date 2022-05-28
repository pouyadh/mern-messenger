require("dotenv").config();
exports.mongooseConfig = {
  uri: process.env.MONGO_URL,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

exports.corsConfig = {
  origin: process.env.FRONT_END_ORIGIN,
  credentials: true,
};

exports.appConfig = { port: process.env.PORT || 8080 };

exports.socketConfig = {
  options: {
    cors: {
      origin: process.env.FRONT_END_ORIGIN,
      credentials: true,
    },
  },
};

exports.tokenConfig = {
  secret: process.env.TOKEN_SECRET_KEY || "ThisIsTheFallbackSecret",
};
