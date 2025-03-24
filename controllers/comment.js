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
    const { content, replyingTo, replyingToUsername } = req.body;
    const productRequestId = req.params.id;

    const comment = await Comment.create({
        content,
        user: req.user._id,
        productRequest: productRequestId,
        replyingTo: replyingTo || null,
        replyingToUsername: replyingToUsername || null, 
    });


    const populatedComment = await Comment.findById(comment._id).populate(
        'user',
        'firstname lastname username image role'
    );

    req.statusCode = 201;
    req.response = {
        status: 'success',
        data: {
            comment: populatedComment,
        },
    };
    next();
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
