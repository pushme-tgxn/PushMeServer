const jwt = require("jsonwebtoken");

function generateToken(userId) {
  const secret = process.env.SECRET;

  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

module.exports = {
  generateToken,
};
