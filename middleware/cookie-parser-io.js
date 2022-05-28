const cookieParser = require("cookie-parser");
const cookieParserIo = () => (socket, next) =>
  cookieParser()(socket.request, {}, next);

module.exports = cookieParserIo;
