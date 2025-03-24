const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.signJwt = function (payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};
module.exports.verifyJwt = function (payload) {
    return jwt.verify(payload, process.env.JWT_SECRET);
};

module.exports.validateToken = async function (token) {
    try {
      console.log(token, "token?")
        const payload = module.exports.verifyJwt(token);
       
        return await User.findById(payload._id);
    } catch (err) {
        return null;
    }
};
