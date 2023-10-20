const express = require("express")
const router = express.Router()
const { sendResponse } = require("../middleware/response")
const {
  createReply,
  getSingleReply,
  updateSingleReply,
  deleteSingleReply,
  searchForReplys,
} = require("../controllers/reply")
const { authorize } = require("../middleware/auth")

router.get("/", searchForReplys, sendResponse)
router.get("/:id", getSingleReply, sendResponse)
router.use(authorize)
router.post("/", createReply, sendResponse)
router.put("/:id", updateSingleReply, sendResponse)
router.delete("/:id", deleteSingleReply, sendResponse)

module.exports = router
