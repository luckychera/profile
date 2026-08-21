const jwt = require("jsonwebtoken");
const logger = require("./logger");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("Authorization token required");
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // optional, attach user info
    next();
  } catch (err) {
    logger.error(`JWT verification failed: ${err.message}`);
    const error = new Error("Invalid or expired token");
    error.status = 401;
    next(error);
  }
}

module.exports = authenticate;
