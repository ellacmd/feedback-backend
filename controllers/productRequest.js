const ProductRequest = require("../models/productRequest")
const { routeTryCatcher, QueryBuilder } = require("../utils/controller.js")

async function createNewProductRequest(productRequestData = {}) {
  const newProdRequest = new ProductRequest(productRequestData)
  return await newProdRequest.save()
}
async function updateProductRequest(id, update = {}) {
  return ProductRequest.findByIdAndUpdate(
    id,
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
    productRequest: await createNewProductRequest(req.body),
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
    productRequest: await updateProductRequest(req.params.id, req.body),
  }
  next()
})

module.exports.deleteSingleProductRequest = routeTryCatcher(async function (
  req,
  res,
  next
) {
  req.statusCode = 204
  req.response = {
    productRequest: await ProductRequest.findByIdAndDelete(req.params.id),
  }
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
