const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
  {
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
  },
  {
    collation: { locale: "en", strength: 2 },
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
  }
)

commentSchema.virtual("replies")
commentSchema.post(/^find/, async function (doc, next) {
  if (doc !== null)
    doc.replies = await Reply.find({ productRequest: doc._id })
      .sort({
        createdAt: -1,
      })
      .limit(10)
  next()
})

commentSchema.pre(/^find/, async function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: "user",
    options: { _recursed: true, select: "-password" },
  })
  next()
})

module.exports = mongoose.model("Comment", commentSchema)
