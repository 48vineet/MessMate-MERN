// middleware/notFound.js
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404).json({
      success: false,
      message: error.message,
      availableEndpoints: {
        auth: '/api/auth/*',
        users: '/api/users/*',
        menu: '/api/menu/*',
        bookings: '/api/bookings/*',
        inventory: '/api/inventory/*',
        analytics: '/api/analytics/*',
        feedback: '/api/feedback/*',
        payments: '/api/payments/*'
      }
    });
  };
  
  module.exports = notFound;
  