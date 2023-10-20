const { routeTryCatcher } = require("../utils/controller.js")
const { validateToken } = require("../utils/security.js")
const CustomError = require("../utils/error")

module.exports.authorize = routeTryCatcher(async function (req, res, next) {
  const token =
    req.headers["authorization"]?.split(" ")?.[1] || req.headers.access_token
  if (!token) return next(new CustomError("Not Allowed", 403))
  const user = await validateToken(token)
  if (!user) return next("Not Allowed!")
  req.user = user
  next()
})
