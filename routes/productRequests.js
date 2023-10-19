const express = require("express")
const router = express.Router()
const { sendResponse } = require("../middleware/response")
const {
  newProductRequest,
  getSingleProductRequest,
  updateSingleProductRequest,
  deleteSingleProductRequest,
  searchForProductRequests,
} = require("../controllers/productRequest")
const { authorize, authorizeAdmin } = require("../middleware/auth")

router.use(authorize)
router.get("/:id", getSingleProductRequest, sendResponse)
router.get("/", searchForProductRequests, sendResponse)

router.use(authorizeAdmin)
router.post("/", newProductRequest, sendResponse)
router.put("/:id", updateSingleProductRequest, sendResponse)
router.delete("/:id", deleteSingleProductRequest, sendResponse)

module.exports = router
