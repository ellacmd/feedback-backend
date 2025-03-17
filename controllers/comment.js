const Comment = require('../models/comment');
const { routeTryCatcher, QueryBuilder } = require('../utils/controller.js');
const mongoose = require('mongoose');

async function createNewComment(CommentData = {}) {
    if (CommentData.replyingTo) {
        const parentComment = await Comment.findById(CommentData.replyingTo);
        if (parentComment && parentComment.replyingTo) {
            CommentData.replyingTo = parentComment.replyingTo;
        }
    }

    const newComment = new Comment({ ...CommentData });
    return await newComment.save();
}

module.exports.create = createNewComment;

module.exports.getSingleComment = routeTryCatcher(async function (
    req,
    res,
    next
) {
    req.statusCode = 200;
    req.response = {
        comment: await Comment.findById(req.params.id),
    };
    next();
});

module.exports.deleteSingleComment = routeTryCatcher(async function (
    req,
    res,
    next
) {
    req.statusCode = 204;
    req.response = {
        comment: await Comment.findByIdAndDelete(req.params.id),
    };
    return next();
});

module.exports.updateSingleComment = routeTryCatcher(async function (
    req,
    res,
    next
) {
    req.statusCode = 200;
    const { content } = req.body;
    req.response = {
        comment: await Comment.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            {
                content,
            },
            { new: true }
        ),
    };
    return next();
});

module.exports.createComment = routeTryCatcher(async function (req, res, next) {
    const { content, productRequest, replyingTo } = req.body;

    // First verify that the parent comment exists and belongs to this product request
    if (replyingTo && mongoose.Types.ObjectId.isValid(replyingTo)) {
        const parentComment = await Comment.findOne({
            _id: replyingTo,
            productRequest: productRequest,
        });

        if (!parentComment) {
            throw new Error('Parent comment not found in this product request');
        }
    }

    let comment = await createNewComment({
        content,
        productRequest,
        user: req.user._id,
        replyingTo:
            replyingTo && mongoose.Types.ObjectId.isValid(replyingTo)
                ? replyingTo
                : null,
    });

    // Let the model middleware handle population
    comment = await Comment.findById(comment._id);

    req.statusCode = 201;
    req.response = {
        comment,
        message: 'Comment added!',
    };
    return next();
});

module.exports.searchForComments = routeTryCatcher(async function (
    req,
    res,
    next
) {
    const commentQueryBuilder = new QueryBuilder(Comment, req.query);
    const comments = await commentQueryBuilder.find();
    req.statusCode = 200;
    req.response = {
        comments,
        count: comments.length,
        hasMore: comments.length >= commentQueryBuilder.limit,
        page: commentQueryBuilder.page,
    };
    next();
});
