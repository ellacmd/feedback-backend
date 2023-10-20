const { update } = require("../controllers/productRequest")
const ProductRequest = require("../models/productRequest")

async function downvote(data, next, socket, io) {
  try {
    const requestData = typeof data === "string" ? JSON.parse(data) : data
    let productRequest
    if (requestData.productRequest) {
      productRequest = await ProductRequest.findById(requestData.productRequest)
      productRequest = await update(
        { _id: requestData.productRequest },
        {
          upvotes:
            productRequest.upvotes - 1 >= 0 ? productRequest.upvotes - 1 : 0,
        }
      )
      return io.emit("downvote", { done: true, productRequest })
    }
    socket.emit("downvote", { done: false, message: "Invalid request!" })
    return next()
  } catch (err) {
    next(err)
  }
}
async function upvote(data = {}, next, socket, io) {
  try {
    const requestData = typeof data === "string" ? JSON.parse(data) : data
    let productRequest
    if (requestData.productRequest) {
      productRequest = await ProductRequest.findById(requestData.productRequest)
      productRequest = await update(requestData.productRequest, {
        upvotes: productRequest.upvotes + 1,
      })
      return io.emit("upvote", { done: true, productRequest })
    }
    socket.emit("upvote", { done: false, message: "Invalid request!" })
    return next()
  } catch (err) {
    next(err)
  }
}

module.exports = {
  upvote,
  downvote,
}
