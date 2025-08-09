// controllers/contactController.js
const nodemailer = require('nodemailer');

// @desc    Send contact form email
// @route   POST /api/contact
// @access  Public
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, mobile, subject, description } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if email configuration exists
    if (!process.env.EMAIL_PASSWORD) {
      console.error('Email configuration missing:', {
        EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD
      });
      return res.status(500).json({
        success: false,
        message: 'Email service not configured. Please contact administrator.'
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '7038vineet@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Always send to vinitmali991@gmail.com
    const recipientEmail = 'vinitmali991@gmail.com';

    // Email content
    const mailOptions = {
      from: '7038vineet@gmail.com',
      to: recipientEmail,
      subject: `MessMate Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">MessMate Support</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Contact Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #333;">Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #333;">Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #333;">Mobile:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">${mobile}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #333;">Subject:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">${subject}</td>
              </tr>
            </table>
            
            <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
              <p style="color: #666; line-height: 1.6; margin: 0;">${description}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #888; font-size: 14px; text-align: center;">
                This message was sent from the MessMate contact form.<br>
                Please respond to ${email} to reply to the user.
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Contact email sent successfully to ${recipientEmail} from ${email}`);

    res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!'
    });

  } catch (error) {
    console.error('Contact email error:', error);
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        message: 'Email authentication failed. Please check email configuration.'
      });
    }
    
    if (error.code === 'ECONNECTION') {
      return res.status(500).json({
        success: false,
        message: 'Unable to connect to email service. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send contact email. Please try again later.'
    });
  }
}; 