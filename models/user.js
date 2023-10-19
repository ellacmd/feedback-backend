const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  image: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: [true, "Please provide your name!"],
  },
  username: {
    type: String,
    required: [true, "Please provide a username!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
})

userSchema.methods.comparePassword = async function (plainValue) {
  return await bcrypt.compare(plainValue, this.password)
}
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 8)
  next()
})

module.exports = mongoose.model("User", userSchema)
