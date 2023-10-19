const { routeTryCatcher } = require("../utils/controller.js")
const { verifyJwt } = require("../utils/security.js")
const User = require("../models/user")

module.exports.authorize = routeTryCatcher(async function (req, res, next) {
  const token =
    req.headers["authorization"]?.split(" ")?.[1] || req.headers.access_token
  if (!token) return next("Not Allowed")
  const payload = verifyJwt(token)
  if (new Date(Date.now()) - new Date(payload.iat * 1000) > 8.64e7)
    return next("Not Allowed")
  const user = await User.findById(payload._id)
  if (!user) return next("Not Allowed!")
  req.user = user
  next()
})
