const QRCode = require('qrcode');

/**
 * Generate UPI QR code data URL
 * @param {string} upiId - The UPI ID (e.g., '7038738012-2@ybl')
 * @param {number} amount - Amount to pay (optional)
 * @param {string} name - Payee name (optional)
 * @param {string} note - Payment note (optional)
 * @returns {Promise<string>} - Data URL of the QR code
 */
const generateUPIQR = async (upiId, amount = null, name = 'MessMate', note = 'Wallet Recharge') => {
  try {
    // Create UPI payment URL
    let upiUrl = `upi://pay?pa=${upiId}`;
    
    // Add payee name
    if (name) {
      upiUrl += `&pn=${encodeURIComponent(name)}`;
    }
    
    // Add amount if provided
    if (amount && amount > 0) {
      upiUrl += `&am=${amount}`;
    }
    
    // Add payment note
    if (note) {
      upiUrl += `&tn=${encodeURIComponent(note)}`;
    }
    
    // Add currency (INR)
    upiUrl += '&cu=INR';
    
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    return {
      success: true,
      qrDataUrl,
      upiUrl,
      upiId
    };
  } catch (error) {
    console.error('Error generating UPI QR code:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate QR code for a specific amount
 * @param {string} upiId - The UPI ID
 * @param {number} amount - Amount to pay
 * @param {string} note - Payment note
 * @returns {Promise<string>} - Data URL of the QR code
 */
const generateAmountQR = async (upiId, amount, note = 'Wallet Recharge') => {
  return generateUPIQR(upiId, amount, 'MessMate', note);
};

/**
 * Generate generic QR code (without amount)
 * @param {string} upiId - The UPI ID
 * @returns {Promise<string>} - Data URL of the QR code
 */
const generateGenericQR = async (upiId) => {
  return generateUPIQR(upiId, null, 'MessMate', 'Wallet Recharge');
};

module.exports = {
  generateUPIQR,
  generateAmountQR,
  generateGenericQR
}; 