class ApiResponse {
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data
    };
  }

  static error(message, error = null, statusCode = 500) {
    const response = {
      success: false,
      message
    };

    if (error) {
      response.error = error;
    }

    return response;
  }
}

module.exports = ApiResponse; 