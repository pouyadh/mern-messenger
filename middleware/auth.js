const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const auth =
      req.cookies.token ||
      req.body.token ||
      req.query.token ||
      req.headers["x-access-token"] ||
      req.headers["authorization"];

    const [tokenType, token] = auth.split(" ");
    if (!token || tokenType !== "Bearer") {
      return res
        .json({ msg: "A token is required for authentication" })
        .status(403);
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    return res.json({ msg: "Invalid Token" }).status(401);
  }
  return next();
};

module.exports = verifyToken;
