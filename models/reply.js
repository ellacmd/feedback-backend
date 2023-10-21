const mongoose = require("mongoose")

const replySchema = new mongoose.Schema(
  {
    content: { type: String, maxLength: 250 },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required!"],
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: [true, "Comment Id is required!"],
    },
    replyingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'Required field "replyingTo"'],
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

replySchema.pre(/^find/, async function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: "user",
    options: { _recursed: true, select: "-password" },
  })
  next()
})

module.exports = mongoose.model("Reply", replySchema)
