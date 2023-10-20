const User = require("../models/user")
const { routeTryCatcher, QueryBuilder } = require("../utils/controller.js")
const { signJwt } = require("../utils/security.js")
const CustomError = require("../utils/error")

async function createUser(userData = {}) {
  const newUser = new User({ ...userData, role: "user" })
  return await newUser.save()
}

module.exports.checkIfIsOwnerAndUserOfIdParam = routeTryCatcher(function (
  req,
  res,
  next
) {
  if (req.user?._id?.toString() !== req.params.id)
    return next(new CustomError("Not Allowed!!", 403))
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
  req.statusCode = 200
  const { name, image, firstname, lastname } = req.body
  req.response = {
    user: await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name || req.user.name,
        image: image || req.user.image,
        firstname: firstname || req.user.firstname,
        lastname: lastname || req.user.lastname,
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

module.exports.searchForUsers = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const UserQueryBuilder = new QueryBuilder(User, req.query)
  const users = await UserQueryBuilder.find()
  req.statusCode = 200
  req.response = {
    users,
    count: users.length,
    hasMore: users.length >= UserQueryBuilder.limit,
    page: UserQueryBuilder.page,
  }
  next()
})
