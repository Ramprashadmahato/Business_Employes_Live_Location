// utils/responseFormatter.js

/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Optional message
 */
export const successResponse = (res, data, message = "Success") => {
  return res.status(200).json({ success: true, message, data });
};

/**
 * Standard error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} code - HTTP status code (default 500)
 */
export const errorResponse = (res, message = "Error", code = 500) => {
  return res.status(code).json({ success: false, message });
};
