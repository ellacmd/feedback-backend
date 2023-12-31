const Reply = require("../models/reply")
const { routeTryCatcher, QueryBuilder } = require("../utils/controller.js")

async function createNewReply(ReplyData = {}) {
  const newReply = new Reply({ ...ReplyData })
  return await newReply.save()
}

async function updateReply(filter, update) {
  return await Reply.findOneAndUpdate(filter, update, { new: true })
}
async function deleteReply(filter = {}) {
  return await Reply.findOneAndDelete(filter)
}

module.exports.create = createNewReply
module.exports.update = updateReply
module.exports.deleteReply = deleteReply

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
  await deleteReply({ _id: req.params.id})
  req.statusCode = 204
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
    reply: await updateReply(
      { _id: req.params.id, user: req.user._id, comment: req.params.comment },
      {
        content,
      }
    ),
  }
  return next()
})

module.exports.createReply = routeTryCatcher(async function (req, res, next) {
  const reply = await createNewReply({
    comment: req.params.comment,
    content: req.body.content,
    user: req.user._id,
  })
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
    replies,
    count: replies.length,
    hasMore: replies.length >= replyQueryBuilder.limit,
    page: replyQueryBuilder.page,
  }
  next()
})
