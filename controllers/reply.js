const Reply = require("../models/reply")
const { routeTryCatcher, QueryBuilder } = require("../utils/controller.js")

async function createNewReply(ReplyData = {}) {
  const newReply = new Reply({ ...ReplyData })
  return await newReply.save()
}

module.exports.create = createNewReply

module.exports.getSingleReply = routeTryCatcher(async function (
  req,
  res,
  next
) {
  req.statusCode = 200
  req.response = {
    reply: await Reply.findById(req.params.id),
  }
  next()
})

module.exports.deleteSingleReply = routeTryCatcher(async function (
  req,
  res,
  next
) {
  req.statusCode = 204
  req.response = {
    reply: await Reply.findByIdAndDelete(req.params.id),
  }
  return next()
})

module.exports.updateSingleReply = routeTryCatcher(async function (
  req,
  res,
  next
) {
  req.statusCode = 200
  const { content } = req.body
  req.response = {
    reply: await Reply.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        content,
      },
      { new: true }
    ),
  }
  return next()
})

module.exports.createReply = routeTryCatcher(async function (req, res, next) {
  const reply = await createNewReply({ ...req.body, user: req.user._id })
  req.statusCode = 201
  req.response = {
    reply,
    message: "Reply added!",
  }
  return next()
})

module.exports.searchForReplys = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const replyQueryBuilder = new QueryBuilder(Reply, req.query)
  const replies = await replyQueryBuilder.find()
  req.statusCode = 200
  req.response = {
    replys,
    count: replies.length,
    hasMore: replies.length >= replyQueryBuilder.limit,
    page: replyQueryBuilder.page,
  }
  next()
})
