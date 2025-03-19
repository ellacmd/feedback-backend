const ProductRequest = require('../models/productRequest');
const Comment = require('../models/comment');
const { routeTryCatcher, QueryBuilder } = require('../utils/controller.js');
const CustomError = require('../utils/error');

async function createNewProductRequest(productRequestData = {}) {
    const newProdRequest = new ProductRequest(productRequestData);
    return await newProdRequest.save();
}
async function updateProductRequest(filter, update = {}) {
    console.log('res>>', filter);
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

    // 1. Get the current document state
    let productRequest = await ProductRequest.findById(productRequestId);
    console.log('1. Initial state:', {
        id: productRequestId,
        userId: userId,
        currentUpvotes: productRequest.upvotes,
        currentUpvotedBy: productRequest.upvotedBy,
    });

    if (!productRequest) {
        req.statusCode = 404;
        req.response = {
            status: 'fail',
            message: 'Product request not found',
        };
        return next();
    }

    // 2. Check if user has already upvoted
    const hasUpvoted = productRequest.upvotedBy.includes(userId);
    console.log('2. Has user upvoted:', hasUpvoted);

    // 3. Update the arrays directly
    if (!hasUpvoted) {
        // Add the upvote
        productRequest.upvotedBy = [...productRequest.upvotedBy, userId];
    } else {
        // Remove the upvote
        productRequest.upvotedBy = productRequest.upvotedBy.filter(
            (id) => id.toString() !== userId.toString()
        );
    }

    // 4. Set the upvotes count
    productRequest.upvotes = productRequest.upvotedBy.length;

    console.log('3. Before save:', {
        upvotes: productRequest.upvotes,
        upvotedBy: productRequest.upvotedBy,
    });

    // 5. Save the changes
    await productRequest.save();

    // 6. Get fresh copy to verify
    productRequest = await ProductRequest.findById(productRequestId);
    console.log('4. After save:', {
        upvotes: productRequest.upvotes,
        upvotedBy: productRequest.upvotedBy,
    });

    req.statusCode = 200;
    req.response = {
        status: 'success',
        productRequest,
    };
    next();
});
