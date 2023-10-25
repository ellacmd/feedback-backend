const express = require("express")
const router = express.Router()
const { sendResponse } = require("../middleware/response")
const {
  newProductRequest,
  getSingleProductRequest,
  updateSingleProductRequest,
  deleteSingleProductRequest,
  searchForProductRequests,
  checkDocumentBelongsToUser,
} = require("../controllers/productRequest")
const { authorize } = require("../middleware/auth")
const {
} = require("../controllers/user")

router.get("/", searchForProductRequests, sendResponse)
router.get("/:id", getSingleProductRequest, sendResponse)

router.use(authorize)
router.post("/", newProductRequest, sendResponse)
router.put("/:id", checkDocumentBelongsToUser, updateSingleProductRequest, sendResponse)
router.delete("/:id", checkDocumentBelongsToUser, deleteSingleProductRequest, sendResponse)

module.exports = router
