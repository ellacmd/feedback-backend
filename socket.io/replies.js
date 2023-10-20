const { create, update, deleteReply } = require("../controllers/reply")

async function reply(data, next, socket, io) {
  try {
    const requestData = typeof data === "string" ? JSON.parse(data) : data
    if (requestData.content && requestData.comment) {
      let reply = await create({
        user: socket.user._id,
        content: requestData.content,
        comment: requestData.comment,
      })
      return io.emit("reply", { done: true, reply })
    }
    socket.emit("reply", { done: false, message: "Invalid request!" })
    return next()
  } catch (err) {
    next(err)
  }
}

async function edit(data, next, socket, io) {
  try {
    const requestData = typeof data === "string" ? JSON.parse(data) : data
    if (requestData.content && requestData.comment && requestData._id) {
      let reply = await update({
        _id: requestData._id,
        user: socket.user._id,
        content: requestData.content,
        comment: requestData.comment,
      })
      return io.emit("edit", { done: true, reply })
    }
    socket.emit("edit", { done: false, message: "Invalid request!" })
    return next()
  } catch (err) {
    next(err)
  }
}

async function deleteReplyHandler(data, next, socket, io) {
  try {
    const requestData = typeof data === "string" ? JSON.parse(data) : data
    if (requestData.comment && requestData._id) {
      let reply = await update({
        user: socket.user._id,
        comment: requestData.comment,
        _id: requestData._id,
      })
      return io.emit("delete-reply", { done: true, reply })
    }
    socket.emit("delete-reply", { done: false, message: "Invalid request!" })
    return next()
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports = {
  reply,
  edit,
  "delete-reply": deleteReplyHandler,
}
