const mongoose = require("mongoose")
const Comment = require("./comment")

const productRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required!"],
    },
    title: {
      type: String,
      required: [true, "A product request must have a title"],
    },
    category: {
      type: String,
      enum: ["enhancement", "feature", "bug", "ui", "ux"],
      required: [true, "A product request must have a category"],
    },
    upvotes: { type: Number, default: 0 }, // sockets
    status: {
      type: String,
      enum: ["suggestion", "planned", "in-progress", "live"],
      required: [true, "A product request must have a status"],
    },
    description: {
      type: String,
      maxLength: 150,
      default: "",
    }
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    collation: { locale: "en", strength: 2 },
    timestamps: true,
  }
)
productRequestSchema.virtual("comments")
productRequestSchema.virtual("commentCount")
productRequestSchema.post(/^findOne/, async function (doc, next) {
  if (doc !== null) {
    const comments = await Comment.find({ productRequest: doc._id })
      .sort({
        createdAt: -1,
      })
      .limit(50)
    doc.comments = comments
    doc.commentCount = comments.length
  }
  next()
})

module.exports = mongoose.model("ProductRequest", productRequestSchema)
