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
router.get("/:comment/:id", getSingleReply, sendResponse)
router.use(authorize)
router.post("/:comment", createReply, sendResponse)
router.put("/:comment/:id", updateSingleReply, sendResponse)
router.delete("/:comment/:id", deleteSingleReply, sendResponse)

module.exports = router
