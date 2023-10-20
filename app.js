var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
require("dotenv").config()
var indexRouter = require("./routes/index")
var usersRouter = require("./routes/users")
var commentsRouter = require("./routes/comments")
var repliesRouter = require("./routes/replies")
var productRequestsRouter = require("./routes/productRequests")
const CustomError = require("./utils/error")
const globalErrorHandler = require("./middleware/error")

var app = express()

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

app.use("/api/v1", indexRouter)
app.use("/api/v1/users", usersRouter)
app.use("/api/v1/product-requests", productRequestsRouter)
app.use("/api/v1/comments", commentsRouter)
app.use("/api/v1/replies", repliesRouter)

app.all("*", (req, _, next) => {
  next(
    new CustomError(
      `CANNOT ${req.method} ${req.originalUrl} on this server!`,
      404
    )
  )
})
app.use(globalErrorHandler)

module.exports = app
