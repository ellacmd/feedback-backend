const { validateToken } = require("../utils/security")

module.exports = async function (socket, next) {
  if (socket.handshake.headers && socket.handshake.headers.token) {
    try {
      const user = await validateToken(socket.handshake.headers.token)
      if (user) {
        socket.user = user
        return next()
      } else {
        return next("Not Allowed!")
      }
    } catch (err) {
      next(err)
    }
  } else {
    next(new Error("Authentication error"))
  }
}
