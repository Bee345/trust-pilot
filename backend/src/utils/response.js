const success = (res, data, code = 200) =>
  res.status(code).json({ success: true, data });

const error = (res, message, code = 400) =>
  res.status(code).json({ success: false, message });

module.exports = { success, error };
