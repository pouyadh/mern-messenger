const jwt = require("jsonwebtoken");
module.exports = (secret) => (socket, next) => {
  try {
    const token = socket.request.cookies?.token;
    if (!token) {
      return next(new Error("token required"));
    }
    const [tokenType, tokenBody] = token.split(" ");
    if (tokenType !== "Bearer" || !tokenBody) {
      return next(new Error("unauthorized"));
    }

    const auth = jwt.verify(tokenBody, secret);
    socket.data.auth = auth;
    return next();
  } catch (error) {
    console.log({ origin: "socket/auth", err: error });
    next(new Error("unauthorized"));
  }
};
