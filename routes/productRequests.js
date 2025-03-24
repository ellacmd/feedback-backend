const express = require('express');
const router = express.Router();
const { sendResponse } = require('../middleware/response');
const {
    newProductRequest,
    getSingleProductRequest,
    updateSingleProductRequest,
    deleteSingleProductRequest,
    searchForProductRequests,
    checkDocumentBelongsToUser,
    toggleUpvote,
} = require('../controllers/productRequest');
const { authorize } = require('../middleware/auth');
const { createComment } = require('../controllers/comment');
const {} = require('../controllers/user');

router.get('/', searchForProductRequests, sendResponse);
router.get('/:id', getSingleProductRequest, sendResponse);

router.use(authorize);
router.post('/', newProductRequest, sendResponse);
router.patch('/:id/upvote', toggleUpvote, sendResponse);
router.put(
    '/:id',
    checkDocumentBelongsToUser,
    updateSingleProductRequest,
    sendResponse
);
router.delete(
    '/:id',
    checkDocumentBelongsToUser,
    deleteSingleProductRequest,
    sendResponse
);

router.post('/:id/comments', createComment, sendResponse);

module.exports = router;
