const { create } = require("../controllers/comment")

async function comment(data, next, socket, io) {
  try {
    const requestData = typeof data === "string" ? JSON.parse(data) : data
    if (requestData.content && requestData.productRequest) {
      comment = await create({
        user: socket.user._id,
        content: requestData.content,
        productRequest: requestData.productRequest,
      })
      return io.emit("comment", { done: true, comment })
    }
    socket.emit("comment", { done: false, message: "Invalid request!" })
    return next()
  } catch (err) {
    next(err)
  }
}

module.exports = {
  comment,
}
