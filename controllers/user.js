const User = require("../models/user")
const { routeTryCatcher } = require("../utils/controller.js")
const { signJwt } = require("../utils/security.js")

async function createUser(userData = {}) {
  const newUser = new User(userData)
  return await newUser.save()
}

module.exports.checkIfIsOwnerAndUserOfIdParam = routeTryCatcher(function (
  req,
  res,
  next
) {
  console.log("auth passed")
  if (req.user?._id?.toString() !== req.params.id) return next("Not Allowed!!")
  next()
})
module.exports.getUser = routeTryCatcher(async function (req, res, next) {
  req.statusCode = 200
  req.response = {
    user: await User.findById(req.params.id),
  }
  next()
})

module.exports.deleteUser = routeTryCatcher(async function (req, res, next) {
  req.statusCode = 204
  req.response = {
    user: await User.findByIdAndDelete(req.params.id),
  }
  return next()
})

module.exports.updateUser = routeTryCatcher(async function (req, res, next) {
  req.statusCode = 203
  const { name, image } = req.body
  req.response = {
    user: await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name || req.user.name,
        image: image || req.user.image,
      },
      { new: true, select: "-password" }
    ),
  }
  return next()
})

module.exports.signupUser = routeTryCatcher(async function (req, res, next) {
  const user = await createUser(req.body)
  req.statusCode = 201
  req.response = {
    user,
    message: "Profile created successfully!",
  }
  return next()
})

module.exports.loginUser = routeTryCatcher(async function (req, res, next) {
  req.statusCode = 400
  req.response = { message: "All fields are required!" }
  if (!req.body.username || !req.body.password) return next()

  req.response = { message: "Invalid credentials!" }
  const user = await User.findOne({ username: req.body.username })
  if (!user) return next()
  if (!(await user.comparePassword(req.body.password))) return next()

  const token = signJwt({ _id: user._id })
  req.statusCode = 200
  req.response = {
    user,
    token,
    message: "Logged in!",
  }
  next()
})
