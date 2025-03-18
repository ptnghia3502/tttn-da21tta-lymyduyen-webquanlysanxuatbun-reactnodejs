/**
 * Utility class for standardized API responses
 */
class ApiResponse {
  /**
   * Create a success response
   * @param {*} data - The data to return
   * @param {string} message - Optional success message
   * @returns {Object} Standardized success response
   */
  static success(data, message = null) {
    const response = {
      success: true
    };

    if (data !== null && data !== undefined) {
      response.data = data;
    }

    if (message) {
      response.message = message;
    }

    return response;
  }

  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {*} error - Optional error details (only included in development)
   * @param {Array} errors - Optional validation errors
   * @returns {Object} Standardized error response
   */
  static error(message, error = null, errors = null) {
    const response = {
      success: false,
      message
    };

    if (process.env.NODE_ENV === 'development' && error) {
      response.error = error.toString();
    }

    if (errors) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Create a pagination response
   * @param {Array} data - The data array
   * @param {Object} pagination - Pagination details
   * @returns {Object} Standardized pagination response
   */
  static paginate(data, pagination) {
    return {
      success: true,
      data,
      pagination
    };
  }
}

module.exports = ApiResponse; 