const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
  content: { type: String, maxLength: 250 },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User Id is required!"],
  },
  productRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductRequest",
    required: [true, "Product Request Id is required!"],
  },
})

commentSchema.pre(/^find/, async function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({ path: "user productRequest", options: { _recursed: true } })
  next()
})

module.exports = mongoose.model("Comment", commentSchema)
