const ProductRequest = require('../models/productRequest');
const Comment = require('../models/comment');
const { routeTryCatcher, QueryBuilder } = require('../utils/controller.js');
const CustomError = require('../utils/error');

async function createNewProductRequest(productRequestData = {}) {
    const newProdRequest = new ProductRequest(productRequestData);
    return await newProdRequest.save();
}
async function updateProductRequest(filter, update = {}) {
    return ProductRequest.findOneAndUpdate(
        filter,
        {
            ...update,
        },
        {
            new: true,
        }
    );
}
module.exports.create = createNewProductRequest;
module.exports.update = updateProductRequest;

module.exports.newProductRequest = routeTryCatcher(async function (
    req,
    res,
    next
) {
    req.statusCode = 201;
    req.response = {
        productRequest: await createNewProductRequest({
            ...req.body,
            user: req.user._id,
        }),
        message: 'Product Request created!',
    };
    next();
});

module.exports.checkDocumentBelongsToUser = routeTryCatcher(async function (
    req,
    res,
    next
) {
    const productRequest = await ProductRequest.findById(req.params.id);
    if (
        !productRequest ||
        req.user?._id?.toString() !== productRequest.user?._id?.toString()
    )
        return next(new CustomError('Not Allowed!!', 403));
    req.productRequest = productRequest;
    next();
});

module.exports.getSingleProductRequest = routeTryCatcher(async function (
    req,
    res,
    next
) {
    const productRequest = await ProductRequest.findById(req.params.id);

    const comments = await Comment.aggregate([
        {
            $match: {
                productRequest: productRequest._id,
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
        { $unwind: '$user' },
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
                    { $unwind: '$user' },
                    {
                        $lookup: {
                            from: 'comments',
                            let: { parentId: '$replyingTo' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ['$_id', '$$parentId'] },
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'users',
                                        localField: 'user',
                                        foreignField: '_id',
                                        as: 'parentUser',
                                    },
                                },
                                { $unwind: '$parentUser' },
                            ],
                            as: 'parentComment',
                        },
                    },
                    { $unwind: '$parentComment' },
                    {
                        $project: {
                            _id: 1,
                            content: 1,
                            createdAt: 1,
                            replyingTo: 1,
                            replyingToUsername: {
                                $cond: {
                                    if: { $ne: ['$replyingToUsername', null] },
                                    then: '$replyingToUsername',
                                    else: '$parentComment.parentUser.username',
                                },
                            },
                            user: {
                                _id: '$user._id',
                                username: '$user.username',
                                firstname: '$user.firstname',
                                lastname: '$user.lastname',
                                image: '$user.image',
                                role: '$user.role',
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
                user: {
                    _id: '$user._id',
                    username: '$user.username',
                    firstname: '$user.firstname',
                    lastname: '$user.lastname',
                    image: '$user.image',
                    role: '$user.role',
                },
                replies: 1,
            },
        },
        { $sort: { createdAt: -1 } },
    ]);

    productRequest.comments = comments;
    productRequest.commentCount = await Comment.countDocuments({
        productRequest: productRequest._id,
    });

    req.statusCode = 200;
    req.response = {
        productRequest,
        upvoteCount: productRequest.upvotes,
    };
    next();
});

module.exports.updateSingleProductRequest = routeTryCatcher(async function (
    req,
    res,
    next
) {
    req.statusCode = 200;
    req.response = {
        productRequest: await updateProductRequest(
            { _id: req.params.id, user: req.user._id },
            req.body
        ),
    };
    next();
});

module.exports.deleteSingleProductRequest = routeTryCatcher(async function (
    req,
    res,
    next
) {
    await ProductRequest.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });
    await Comment.deleteMany({ productRequest: req.params.id });
    req.statusCode = 204;
    next();
});

module.exports.searchForProductRequests = routeTryCatcher(async function (
    req,
    res,
    next
) {
    const productRequestQueryBuilder = new QueryBuilder(
        ProductRequest,
        req.query
    );
    const productRequests = await productRequestQueryBuilder.find();
    await Promise.all(
        productRequests.map(async (prodReq) => await prodReq.getCommentCount())
    );
    req.statusCode = 200;
    req.response = {
        productRequests,
        count: productRequests.length,
        hasMore: productRequests.length >= productRequestQueryBuilder.limit,
        page: productRequestQueryBuilder.page,
    };
    next();
});

module.exports.toggleUpvote = routeTryCatcher(async (req, res, next) => {
    const productRequestId = req.params.id;
    const userId = req.user._id;

    let productRequest = await ProductRequest.findById(productRequestId);

    if (!productRequest) {
        req.statusCode = 404;
        req.response = {
            status: 'fail',
            message: 'Product request not found',
        };
        return next();
    }

    const hasUpvoted = productRequest.upvotedBy.includes(userId);

    if (!hasUpvoted) {
        productRequest.upvotedBy = [...productRequest.upvotedBy, userId];
    } else {
        productRequest.upvotedBy = productRequest.upvotedBy.filter(
            (id) => id.toString() !== userId.toString()
        );
    }

    productRequest.upvotes = productRequest.upvotedBy.length;

    await productRequest.save();

    productRequest = await ProductRequest.findById(productRequestId);

    req.statusCode = 200;
    req.response = {
        status: 'success',
        productRequest,
    };
    next();
});
