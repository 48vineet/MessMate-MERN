// UPI Payment component placeholder
export const UPIPayment = ({ isOpen, onClose, amount, orderId, onPaymentSuccess }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">UPI Payment</h2>
          <p className="mb-4">Amount: ₹{amount}</p>
          <p className="mb-4">Order ID: {orderId}</p>
          <button 
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          >
            Close
          </button>
          <button 
            onClick={() => onPaymentSuccess?.()}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Pay Now
          </button>
        </div>
      </div>
    );
  };
  