const jwt = require('jsonwebtoken');


module.exports.signJwt = function(payload){
  return jwt.sign(payload, process.env.JWT_SECRET,{ expiresIn: '1d' });
}
module.exports.verifyJwt = function(payload){
  return jwt.verify(payload, process.env.JWT_SECRET);
}