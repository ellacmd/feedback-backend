const ProductRequest = require("../models/productRequest")
const Comment = require("../models/comment")
const { routeTryCatcher, QueryBuilder } = require("../utils/controller.js")

async function createNewProductRequest(productRequestData = {}) {
  const newProdRequest = new ProductRequest(productRequestData)
  return await newProdRequest.save()
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
  )
}
module.exports.create = createNewProductRequest
module.exports.update = updateProductRequest

module.exports.newProductRequest = routeTryCatcher(async function (
  req,
  res,
  next
) {
  req.statusCode = 201
  req.response = {
    productRequest: await createNewProductRequest({
      ...req.body,
      user: req.user._id,
    }),
    message: "Product Request created!",
  }
  next()
})

module.exports.getSingleProductRequest = routeTryCatcher(async function (
  req,
  res,
  next
) {
  req.statusCode = 200
  req.response = {
    productRequest: await ProductRequest.findById(req.params.id),
  }
  next()
})

module.exports.updateSingleProductRequest = routeTryCatcher(async function (
  req,
  res,
  next
) {
  req.statusCode = 200
  req.response = {
    productRequest: await updateProductRequest({_id: req.params.id, user: req.user._id}, req.body),
  }
  next()
})

module.exports.deleteSingleProductRequest = routeTryCatcher(async function (
  req,
  res,
  next
) {
  await ProductRequest.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  })
  await Comment.deleteMany({ productRequest: req.params.id })
  req.statusCode = 204
  next()
})

module.exports.searchForProductRequests = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const productRequestQueryBuilder = new QueryBuilder(ProductRequest, req.query)
  const productRequests = await productRequestQueryBuilder.find()
  req.statusCode = 200
  req.response = {
    productRequests,
    count: productRequests.length,
    hasMore: productRequests.length >= productRequestQueryBuilder.limit,
    page: productRequestQueryBuilder.page,
  }
  next()
})
