// server/utils/emailTemplates.js

// Base template wrapper
const baseTemplate = (content, title = 'MessMate') => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
          .alert { padding: 15px; border-radius: 6px; margin: 15px 0; }
          .alert-success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
          .alert-warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
          .alert-danger { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
          .booking-card { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 15px 0; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat-item { background-color: #e3f2fd; padding: 15px; border-radius: 6px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${content}
          <div class="footer">
            <p>© ${new Date().getFullYear()} MessMate - Smart Mess Management System</p>
            <p>Made with ❤️ by Vineet Mali DEV</p>
            <p>Need help? Contact us at <a href="mailto:support@messmate.com">support@messmate.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  // Welcome email template
  const welcomeTemplate = (user) => {
    const content = `
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">Welcome to MessMate! 🍽️</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Smart Mess Management System</p>
      </div>
      <div class="content">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name}! 👋</h2>
        
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          Welcome to MessMate! Your account has been successfully created as a <strong>${user.role}</strong>. 
          You're now part of our smart mess management community.
        </p>
        
        <div class="alert alert-success">
          <strong>🎉 Account Created Successfully!</strong><br>
          Your Student ID: <strong>${user.studentId || 'N/A'}</strong><br>
          Account Type: <strong>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</strong>
        </div>
        
        <h3 style="color: #333; margin: 25px 0 15px 0;">What you can do now:</h3>
        <ul style="color: #666; line-height: 1.8; font-size: 15px;">
          <li>🍽️ Browse daily menu items with ratings and reviews</li>
          <li>📅 Book your meals in advance with flexible timing</li>
          <li>💳 Manage your wallet and make UPI payments</li>
          <li>⭐ Rate and review meals to help others</li>
          <li>📊 Track your dining statistics and preferences</li>
          <li>🔔 Get real-time notifications for menu updates</li>
          <li>📱 Generate QR codes for quick check-ins</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/login" class="button">
            Start Using MessMate
          </a>
        </div>
        
        <div class="booking-card">
          <h4 style="margin-top: 0; color: #495057;">💡 Pro Tips:</h4>
          <ul style="color: #6c757d; margin-bottom: 0;">
            <li>Book meals early to ensure availability</li>
            <li>Check today's menu every morning</li>
            <li>Add money to your wallet for seamless payments</li>
            <li>Rate meals to get personalized recommendations</li>
          </ul>
        </div>
      </div>
    `;
    
    return baseTemplate(content, 'Welcome to MessMate');
  };
  
  // Password reset template
  const passwordResetTemplate = (user, resetUrl) => {
    const content = `
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Password Reset Request 🔐</h1>
        <p style="margin: 10px 0 0 0;">MessMate Security</p>
      </div>
      <div class="content">
        <h2 style="color: #333;">Hello ${user.name}! 👋</h2>
        
        <p style="color: #666; line-height: 1.6;">
          You have requested a password reset for your MessMate account. 
          If you didn't make this request, please ignore this email.
        </p>
        
        <div class="alert alert-warning">
          <strong>⚠️ Security Notice:</strong><br>
          This password reset link will expire in <strong>10 minutes</strong> for your security.
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" class="button" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">
            Reset Your Password
          </a>
        </div>
        
        <div class="booking-card">
          <h4 style="margin-top: 0; color: #495057;">🛡️ Security Tips:</h4>
          <ul style="color: #6c757d; margin-bottom: 0;">
            <li>Choose a strong password with at least 8 characters</li>
            <li>Include uppercase, lowercase, numbers, and symbols</li>
            <li>Don't share your password with anyone</li>
            <li>Use a unique password for MessMate</li>
          </ul>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Or copy and paste this URL in your browser:<br>
          <span style="color: #007bff; word-break: break-all; font-family: monospace;">${resetUrl}</span>
        </p>
      </div>
    `;
    
    return baseTemplate(content, 'Password Reset - MessMate');
  };
  
  // Booking confirmation template
  const bookingConfirmationTemplate = (booking, user, menuItem) => {
    const content = `
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Booking Confirmed! ✅</h1>
        <p style="margin: 10px 0 0 0;">Order #${booking.bookingId}</p>
      </div>
      <div class="content">
        <h2 style="color: #333;">Hello ${user.name}! 👋</h2>
        
        <div class="alert alert-success">
          <strong>🎉 Your meal booking has been confirmed!</strong><br>
          Please save this email for your records.
        </div>
        
        <div class="booking-card">
          <h3 style="margin-top: 0; color: #495057;">📋 Booking Details</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <strong>Meal Item</strong><br>
              ${menuItem.name}
            </div>
            <div class="stat-item">
              <strong>Meal Type</strong><br>
              ${booking.mealType.charAt(0).toUpperCase() + booking.mealType.slice(1)}
            </div>
            <div class="stat-item">
              <strong>Date</strong><br>
              ${new Date(booking.bookingDate).toLocaleDateString()}
            </div>
            <div class="stat-item">
              <strong>Time</strong><br>
              ${booking.mealTime}
            </div>
            <div class="stat-item">
              <strong>Quantity</strong><br>
              ${booking.quantity}
            </div>
            <div class="stat-item">
              <strong>Amount Paid</strong><br>
              ₹${booking.finalAmount}
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" class="button">
            View Booking Details
          </a>
        </div>
        
        <div class="alert alert-warning">
          <strong>📱 Quick Check-in:</strong><br>
          Generate your QR code from the app for faster check-in at the mess counter.
        </div>
        
        ${booking.specialRequests ? `
          <div class="booking-card">
            <h4 style="margin-top: 0; color: #495057;">📝 Special Requests:</h4>
            <p style="color: #6c757d; margin-bottom: 0;">${booking.specialRequests}</p>
          </div>
        ` : ''}
      </div>
    `;
    
    return baseTemplate(content, 'Booking Confirmation - MessMate');
  };
  
  // Payment confirmation template
  const paymentConfirmationTemplate = (payment, user) => {
    const content = `
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Payment Successful! 💳</h1>
        <p style="margin: 10px 0 0 0;">Transaction #${payment.transactionId}</p>
      </div>
      <div class="content">
        <h2 style="color: #333;">Hello ${user.name}! 👋</h2>
        
        <div class="alert alert-success">
          <strong>🎉 Your payment has been processed successfully!</strong><br>
          Your wallet has been updated with the new balance.
        </div>
        
        <div class="booking-card">
          <h3 style="margin-top: 0; color: #495057;">💰 Payment Details</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <strong>Amount</strong><br>
              ₹${payment.amount}
            </div>
            <div class="stat-item">
              <strong>Payment Method</strong><br>
              ${payment.paymentMethod.toUpperCase()}
            </div>
            <div class="stat-item">
              <strong>Status</strong><br>
              ${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </div>
            <div class="stat-item">
              <strong>Date & Time</strong><br>
              ${new Date(payment.completedAt).toLocaleString()}
            </div>
          </div>
        </div>
        
        ${payment.paymentMethod === 'upi' ? `
          <div class="booking-card">
            <h4 style="margin-top: 0; color: #495057;">📱 UPI Details:</h4>
            <p style="color: #6c757d; margin-bottom: 10px;">
              <strong>UPI Transaction ID:</strong> ${payment.upiDetails?.upiTransactionId || 'Processing...'}
            </p>
            <p style="color: #6c757d; margin-bottom: 0;">
              <strong>Merchant UPI:</strong> ${process.env.UPI_ID}
            </p>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/wallet" class="button">
            View Wallet Balance
          </a>
        </div>
      </div>
    `;
    
    return baseTemplate(content, 'Payment Confirmation - MessMate');
  };
  
  // Inventory alert template (Admin)
  const inventoryAlertTemplate = (items) => {
    const content = `
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Inventory Alert! ⚠️</h1>
        <p style="margin: 10px 0 0 0;">Stock Level Warning</p>
      </div>
      <div class="content">
        <h2 style="color: #333;">Inventory Management Alert</h2>
        
        <div class="alert alert-danger">
          <strong>🚨 Action Required:</strong><br>
          The following items are running low or out of stock and need immediate attention.
        </div>
        
        ${items.map(item => `
          <div class="booking-card">
            <h4 style="margin-top: 0; color: #495057;">${item.itemName}</h4>
            <div class="stats-grid">
              <div class="stat-item" style="background-color: ${item.currentStock === 0 ? '#f8d7da' : '#fff3cd'};">
                <strong>Current Stock</strong><br>
                ${item.currentStock} ${item.unit}
              </div>
              <div class="stat-item">
                <strong>Minimum Required</strong><br>
                ${item.minimumStock} ${item.unit}
              </div>
              <div class="stat-item">
                <strong>Category</strong><br>
                ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </div>
              <div class="stat-item">
                <strong>Supplier</strong><br>
                ${item.supplier.name}
              </div>
            </div>
            ${item.currentStock === 0 ? 
              '<p style="color: #721c24; font-weight: bold; margin-bottom: 0;">⚠️ OUT OF STOCK</p>' : 
              '<p style="color: #856404; font-weight: bold; margin-bottom: 0;">⚠️ LOW STOCK</p>'
            }
          </div>
        `).join('')}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/admin/inventory" class="button" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">
            Manage Inventory
          </a>
        </div>
      </div>
    `;
    
    return baseTemplate(content, 'Inventory Alert - MessMate');
  };
  
  // Daily summary template (Admin)
  const dailySummaryTemplate = (data) => {
    const content = `
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Daily Summary 📊</h1>
        <p style="margin: 10px 0 0 0;">${new Date().toLocaleDateString()}</p>
      </div>
      <div class="content">
        <h2 style="color: #333;">Today's Performance Summary</h2>
        
        <div class="stats-grid">
          <div class="stat-item">
            <strong>Total Bookings</strong><br>
            ${data.totalBookings}
          </div>
          <div class="stat-item">
            <strong>Revenue</strong><br>
            ₹${data.totalRevenue}
          </div>
          <div class="stat-item">
            <strong>Active Users</strong><br>
            ${data.activeUsers}
          </div>
          <div class="stat-item">
            <strong>Attendance Rate</strong><br>
            ${data.attendanceRate}%
          </div>
        </div>
        
        <div class="booking-card">
          <h3 style="margin-top: 0; color: #495057;">🍽️ Popular Meals Today</h3>
          ${data.popularMeals.map((meal, index) => `
            <p style="color: #6c757d; margin: 5px 0;">
              ${index + 1}. ${meal.name} - ${meal.orders} orders
            </p>
          `).join('')}
        </div>
        
        <div class="booking-card">
          <h3 style="margin-top: 0; color: #495057;">📈 Key Metrics</h3>
          <ul style="color: #6c757d; margin-bottom: 0;">
            <li>Average order value: ₹${data.avgOrderValue}</li>
            <li>Peak booking time: ${data.peakTime}</li>
            <li>Customer satisfaction: ${data.satisfaction}/5</li>
            <li>Pending feedback: ${data.pendingFeedback}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/admin/analytics" class="button">
            View Detailed Analytics
          </a>
        </div>
      </div>
    `;
    
    return baseTemplate(content, 'Daily Summary - MessMate');
  };
  
  module.exports = {
    baseTemplate,
    welcomeTemplate,
    passwordResetTemplate,
    bookingConfirmationTemplate,
    paymentConfirmationTemplate,
    inventoryAlertTemplate,
    dailySummaryTemplate
  };