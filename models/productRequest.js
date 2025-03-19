const mongoose = require('mongoose');
const Comment = require('./comment');

const productRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User Id is required!'],
        },
        title: {
            type: String,
            required: [true, 'A product request must have a title'],
        },
        category: {
            type: String,
            enum: ['enhancement', 'feature', 'bug', 'ui', 'ux'],
            required: [true, 'A product request must have a category'],
        },
        upvotes: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['suggestion', 'planned', 'in-progress', 'live'],
            required: [true, 'A product request must have a status'],
        },
        description: {
            type: String,
            maxLength: 150,
            default: '',
        },
        upvotedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
        collation: { locale: 'en', strength: 2 },
        timestamps: true,
    }
);
productRequestSchema.virtual('comments');
productRequestSchema.virtual('commentCount');

productRequestSchema.methods.getCommentCount = async function () {
    this.commentCount = await Comment.count({ productRequest: this._id });
    return this;
};

productRequestSchema.post(/^findOne/, async function (doc, next) {
    if (doc !== null) {
        const comments = await Comment.aggregate([
            {
                $match: {
                    productRequest: doc._id,
                    replyingTo: null,
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: {
                    path: '$user',
                },
            },
            {
                $lookup: {
                    from: 'comments',
                    let: { commentId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$replyingTo', '$$commentId'] },
                            },
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user',
                            },
                        },
                        {
                            $unwind: '$user',
                        },
                        {
                            $lookup: {
                                from: 'comments',
                                localField: 'replyingTo',
                                foreignField: '_id',
                                as: 'replyingToComment',
                            },
                        },
                        {
                            $unwind: {
                                path: '$replyingToComment',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'replyingToComment.user',
                                foreignField: '_id',
                                as: 'replyingToUser',
                            },
                        },
                        {
                            $unwind: {
                                path: '$replyingToUser',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                content: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                replyingTo: 1,
                                replyingToUsername: '$replyingToUser.username',
                                user: {
                                    _id: '$user._id',
                                    image: '$user.image',
                                    firstname: '$user.firstname',
                                    lastname: '$user.lastname',
                                    username: '$user.username',
                                    role: '$user.role',
                                    createdAt: '$user.createdAt',
                                    updatedAt: '$user.updatedAt',
                                    __v: '$user.__v',
                                },
                            },
                        },
                    ],
                    as: 'replies',
                },
            },
            {
                $project: {
                    _id: 1,
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user: {
                        _id: '$user._id',
                        image: '$user.image',
                        firstname: '$user.firstname',
                        lastname: '$user.lastname',
                        username: '$user.username',
                        role: '$user.role',
                        createdAt: '$user.createdAt',
                        updatedAt: '$user.updatedAt',
                        __v: '$user.__v',
                    },
                    replies: 1,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
        ]);

        doc.comments = comments;
        doc.commentCount = await Comment.count({
            productRequest: doc._id,
        });
    }
    next();
});

// Add a pre-save hook to ensure consistency
productRequestSchema.pre('save', function (next) {
    // Ensure upvotes matches upvotedBy length
    this.upvotes = this.upvotedBy.length;
    next();
});

module.exports = mongoose.model('ProductRequest', productRequestSchema);
