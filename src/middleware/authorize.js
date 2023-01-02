const { expressjwt: jwt, UnauthorizedError } = require("express-jwt");

const { User, UserAuthMethod } = require("../../models/index.js");

const { appLogger } = require("./logging.js");

const secret = process.env.JWT_SECRET;

function authorize() {
  return [
    // authenticate JWT token and attach decoded token to request as req.user
    jwt({ secret, algorithms: ["HS256"] }),

    // attach full user record to request object
    async (req, res, next) => {
      // get user with id from token 'sub' (subject) property
      const user = await User.findByPk(req.auth.sub);

      // check user still exists
      if (!user) {
        appLogger.warn("unauthorized", `user: ${req.auth.sub}`);
        return next(
          new UnauthorizedError(
            "unauthorized",
            new Error("invalid user in token")
          )
        );
      }

      // authorization successful
      appLogger.debug("auth success", `user: ${req.auth.sub}`);

      let userAuthMethods = await UserAuthMethod.scope("noUser").findAll({
        where: { userId: user.id },
      });

      req.methods = userAuthMethods;
      req.user = user.get();
      next();
    },
  ];
}

module.exports = { authorize };
