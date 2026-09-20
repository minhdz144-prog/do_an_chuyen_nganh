const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return next(ApiError.badRequest(error.details.map(d => d.message).join('; ')));
  }
  req.body = value; // Đã strip unknown fields — an toàn
  next();
};

module.exports = validate;
