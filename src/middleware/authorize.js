const jwt = require("express-jwt");
const secret = process.env.SECRET;

const { User } = require("../../models/index.js");

function authorize() {
  return [
    // authenticate JWT token and attach decoded token to request as req.user
    jwt({ secret, algorithms: ["HS256"] }),

    // attach full user record to request object
    async (req, res, next) => {
      console.log("attempted auth", req.user);

      // get user with id from token 'sub' (subject) property
      const user = await User.findByPk(req.user.sub);

      // check user still exists
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });

      // authorization successful
      req.UserReq = req.user;
      req.UserDb = user;
      req.user = user.get();
      next();
    },
  ];
}

module.exports = authorize;
