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
    },
  
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    collation: { locale: "en", strength: 2 },
    timestamps: true
  }
)
productRequestSchema.virtual("comments")
productRequestSchema.post(/^findOne/, async function (doc, next) {
  if (doc !== null)
    doc.comments = await Comment.find({ productRequest: doc._id })
      .sort({
        createdAt: -1,
      })
      .limit(1)
  next()
})

module.exports = mongoose.model("ProductRequest", productRequestSchema)
