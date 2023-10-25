const express = require("express")
const router = express.Router()
const { sendResponse } = require("../middleware/response")
const {
  signupUser,
  loginUser,
  getUser,
  deleteUser,
  updateUser,
  checkIfIsOwnerAndUserOfIdParam,
  searchForUsers,
} = require("../controllers/user")
const { authorize } = require("../middleware/auth")

router.post("/", signupUser, sendResponse)
router.post("/login", loginUser, sendResponse)
router.get("/all", searchForUsers, sendResponse)

router.use(authorize)
router.get("/:id", getUser, sendResponse)
router.put("/:id", checkIfIsOwnerAndUserOfIdParam, updateUser, sendResponse)
router.delete("/:id", checkIfIsOwnerAndUserOfIdParam, deleteUser, sendResponse)

module.exports = router
