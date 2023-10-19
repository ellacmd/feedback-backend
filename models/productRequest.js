const mongoose = require("mongoose")
const Comment = require("./comment")

const productRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A product request must have a title"],
    },
    category: {
      type: String,
      enum: ["enhancement", "feature", "bug"],
      required: [true, "A product request must have a category"],
    },
    upvotes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["suggestion", "planned", "in-progress", "live"],
      required: [true, "A product request must have a status"],
    },
    description: {
      type: String,
      maxLength: 150,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
)

productRequestSchema.pre(/^findOne/, async function (next) {
  this.set("comments", await Comment.find({ productRequest: this._id }))
})

module.exports = mongoose.model("ProductRequest", productRequestSchema)
