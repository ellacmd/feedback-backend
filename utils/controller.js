module.exports.routeTryCatcher = function (asyncRouteHandler) {
  return async function (req, res, next) {
    try {
      return await asyncRouteHandler(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}
