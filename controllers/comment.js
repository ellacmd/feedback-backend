const Comment = require("../models/comment")
const { routeTryCatcher } = require("../utils/controller.js")

async function createNewComment(CommentData = {}) {
  const newComment = new Comment({ ...CommentData })
  return await newComment.save()
}

module.exports.getSingleComment = routeTryCatcher(async function (
  req,
  res,
  next
) {
  req.statusCode = 200
  req.response = {
    comment: await Comment.findById(req.params.id),
  }
  next()
})

module.exports.deleteSingleComment = routeTryCatcher(async function (
  req,
  res,
  next
) {
  req.statusCode = 204
  req.response = {
    comment: await Comment.findByIdAndDelete(req.params.id),
  }
  return next()
})

module.exports.updateSingleComment = routeTryCatcher(async function (
  req,
  res,
  next
) {
  req.statusCode = 200
  const { content } = req.body
  req.response = {
    comment: await Comment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        content,
      },
      { new: true }
    ),
  }
  return next()
})

module.exports.createComment = routeTryCatcher(async function (req, res, next) {
  const comment = await createNewComment({ ...req.body, comment: req.user._id })
  req.statusCode = 201
  req.response = {
    comment,
    message: "Comment added!",
  }
  return next()
})

module.exports.searchForComments = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const commentQueryBuilder = new QueryBuilder(Comment, req.query)
  const comments = await commentQueryBuilder.find()
  req.statusCode = 200
  req.response = {
    comments,
    count: comments.length,
    hasMore: comments.length >= commentQueryBuilder.limit,
    page: commentQueryBuilder.page,
  }
  next()
})
