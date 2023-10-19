const express = require("express")
const router = express.Router()
const { sendResponse } = require("../middleware/response")
const {
  createComment,
  getSingleComment,
  updateSingleComment,
  deleteSingleComment,
  searchForComments,
} = require("../controllers/comment")
const { authorize } = require("../middleware/auth")

router.get("/", searchForComments, sendResponse)
router.use(authorize)
router.get("/:id", getSingleComment, sendResponse)
router.post("/", createComment, sendResponse)
router.put("/:id", updateSingleComment, sendResponse)
router.delete("/:id", deleteSingleComment, sendResponse)

module.exports = router
