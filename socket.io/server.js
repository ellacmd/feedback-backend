const { Server } = require("socket.io")
const productRequestsHandler = require("./productRequests")
const commentsHandler = require("./comments")
const replyHandler = require("./reply")
const authorize = require("./auth")

module.exports = function (server) {
  const socketIo = getIO(server)

  socketIo.on("connection", (socket) => {
    console.log("socket connected")
  })

  const commentsIo = socketIo.of("/api/v1/comments")
  commentsIo.use(authorize)
  commentsIo.use((socket, next) => {
    handleSocketEvents(commentsHandler, socket, commentsIo, next)
    next()
  })

  const replyIo = socketIo.of("/api/v1/reply")
  replyIo.use(authorize)
  replyIo.use((socket, next) => {
    handleSocketEvents(replyHandler, socket, replyIo, next)
    next()
  })

  const productRequestsIo = socketIo.of("/api/v1/product-requests")
  productRequestsIo.use(authorize)
  productRequestsIo.use((socket, next) => {
    handleSocketEvents(productRequestsHandler, socket, productRequestsIo, next)
    next()
  })
}

function getIO(server, options = {}) {
  return new Server(server, {
    ...options,
  })
}

function handleSocketEvents(handlers, socket, io, next) {
  Object.entries(handlers).forEach(([event, handler]) => {
    socket.on(event, (data) => handler(data || {}, next, socket, io))
  })
}
