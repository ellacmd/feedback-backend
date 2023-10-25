const CustomError = require('../utils/error');

const throwDevError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
        statusCode: err.statusCode,
    });
};
const throwProdError = (err, res) => {
    console.error(err);
    err.isOperational
        ? res.status(err.statusCode).json({
              status: err.status,
              message: err.message,
              statusCode: err.statusCode,
          })
        : res.status(500).json({
              status: 'failed',
              message: 'Something went wrong!',
              statusCode: 500,
          });
};
const handleDuplicateKeyError = (err) => {
    const key = Object.keys(err.keyValue)[0];
    const message = `This ${key} is already taken. Try another ${key}`;
    return new CustomError(message, 400);
};
const handleCastError = (err) => {
    const invalid = err.path;
    const message = `Invalid value for ${invalid}`;
    return new CustomError(message, 400);
};
const handleTypeError = () => {
    const message = 'Something went wrong!';
    return new CustomError(message, 500);
};
const handleValidationError = (err) => {
    const message = Object.values(err.errors)
        .map((val) => val.message)
        .join(', ');
    return new CustomError(message, 400);
};
module.exports = (err, req, res, next) => {
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;
    if (process.env.NODE_ENV === 'dev') {
        throwDevError(err, res);
    } else {
        let error = err;
        if (err.name === 'ValidationError') error = handleValidationError(err);
        if (err.code === 11000) error = handleDuplicateKeyError(err);
        if (err.name === 'CastError') error = handleCastError(err);
        if (err.name === 'TypeError') error = handleTypeError(err);
        throwProdError(error, res);
    }
};
