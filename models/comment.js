const mongoose = require('mongoose');
const Reply = require('./reply');

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            maxLength: 250,
            required: [true, 'Comment content is required'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User Id is required!'],
        },
        productRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductRequest',
            required: [true, 'Product Request Id is required!'],
        },
        replyingTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
        },
        replyingToUsername: {
            type: String,
            default: null,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collation: { locale: 'en', strength: 2 },
        toJSON: {
            virtuals: true,
        },
        timestamps: true,
        toObject: { virtuals: true },
    }
);

commentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'replyingTo',
    options: { sort: { createdAt: 1 } }, 
});


commentSchema.index({ productRequest: 1, replyingTo: 1 });

const Comment = mongoose.model('Comment', commentSchema);


commentSchema.post(/^find/, async function (docs) {
    if (!docs) return;

    const populate = {
        path: 'replies',
        populate: {
            path: 'user',
        },
        options: { sort: { createdAt: 1 } },
    };

    if (!Array.isArray(docs)) {
        await Comment.populate(docs, populate);
        return;
    }

    await Comment.populate(docs, populate);
});

commentSchema.pre(/^find/, async function (next) {
    if (this.options._recursed) {
        return next();
    }
    this.populate({
        path: 'user',
        options: { _recursed: true, select: '-password' },
    });
    next();
});

module.exports = Comment;
