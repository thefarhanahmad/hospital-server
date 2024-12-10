const handleMongooseError = (error) => {
  if (error.name === 'ValidationError') {
    return {
      statusCode: 400,
      message: Object.values(error.errors)
        .map(err => err.message)
        .join(', ')
    };
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      statusCode: 409,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    };
  }

  if (error.name === 'CastError') {
    return {
      statusCode: 400,
      message: 'Invalid ID format'
    };
  }

  return {
    statusCode: 500,
    message: 'Internal server error'
  };
};

module.exports = {
  handleMongooseError
};