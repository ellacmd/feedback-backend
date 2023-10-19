module.exports.sendResponse = function (req, res, next) {
  res.status(req.statusCode).json(req.response)
}
