const express = require("express")
const router = express.Router()
const { sendResponse } = require("../middleware/response")
const {
  createComment,
  getSingleComment,
  updateSingleComment,
  deleteSingleComment,
  searchForComments,
} = require("../controllers/comments")
const { authorize, authorizeAdmin } = require("../middleware/auth")

router.use(authorize)
router.get("/:id", getSingleComment, sendResponse)
router.get("/", searchForComments, sendResponse)

router.use(authorizeAdmin)
router.post("/", createComment, sendResponse)
router.put("/:id", updateSingleComment, sendResponse)
router.delete("/:id", deleteSingleComment, sendResponse)

module.exports = router
