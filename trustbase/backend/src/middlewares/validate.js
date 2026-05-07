const { error } = require('../utils/response');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ');
      return error(res, messages, 422);
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = { validate };
