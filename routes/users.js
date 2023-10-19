const express = require("express")
const router = express.Router()
const { sendResponse } = require("../utils/response")
const {
  signupUser,
  loginUser,
  getUser,
  deleteUser,
  updateUser,
  checkIfIsOwnerAndUserOfIdParam,
} = require("../controllers/user")
const { authorize } = require("../middleware/auth")

router.post("/", signupUser, sendResponse)
router.get("/", loginUser, sendResponse)
//authorize
router.use(authorize)
router.get("/:id", getUser, sendResponse)
router.put("/:id", checkIfIsOwnerAndUserOfIdParam, updateUser, sendResponse)
router.delete("/:id", checkIfIsOwnerAndUserOfIdParam, deleteUser, sendResponse)

module.exports = router
