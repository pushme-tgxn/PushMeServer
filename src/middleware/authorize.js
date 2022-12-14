const { expressjwt: jwt } = require("express-jwt");
const secret = process.env.JWT_SECRET;

const { User, UserAuthMethod } = require("../../models/index.js");

function authorize() {
  return [
    // authenticate JWT token and attach decoded token to request as req.user
    jwt({ secret, algorithms: ["HS256"] }),

    // attach full user record to request object
    async (req, res, next) => {
      console.log("attempted auth", req.auth);

      // get user with id from token 'sub' (subject) property
      const user = await User.findByPk(req.auth.sub);

      // check user still exists
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });

      // authorization successful

      let userAuthMethods = await UserAuthMethod.scope("noUser").findAll({
        where: { userId: user.id },
      });

      // req.auth = req.auth;
      // req.UserDb = user;
      req.methods = userAuthMethods;
      req.user = user.get();
      next();
    },
  ];
}

module.exports = { authorize };
