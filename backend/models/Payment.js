const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'card', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true
  },
  stripePaymentIntentId: String,
  paypalOrderId: String,
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  failureReason: String,
  refundReason: String,
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundedAt: Date,
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRefundable: {
    type: Boolean,
    default: true
  },
  refundDeadline: {
    type: Date
  },
  platformFee: {
    type: Number,
    default: 0
  },
  doctorAmount: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  couponCode: String,
  receiptUrl: String,
  invoiceNumber: String
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ appointment: 1 }, { unique: true });
paymentSchema.index({ patient: 1, createdAt: -1 });
paymentSchema.index({ doctor: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });

// Virtual for total amount including fees
paymentSchema.virtual('totalAmount').get(function() {
  return this.amount + this.platformFee + this.taxAmount - this.discountAmount;
});

// Virtual for payment status text
paymentSchema.virtual('statusText').get(function() {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };
  return statusMap[this.status] || 'Unknown';
});

// Method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function() {
  if (!this.isRefundable) return false;
  if (this.status !== 'completed') return false;
  if (this.refundDeadline && new Date() > this.refundDeadline) return false;
  return true;
};

// Method to calculate refund amount
paymentSchema.methods.calculateRefundAmount = function() {
  if (!this.canBeRefunded()) return 0;
  
  // Calculate days since payment
  const daysSincePayment = Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
  
  // Example refund policy: 100% within 24 hours, 50% within 7 days, 0% after
  if (daysSincePayment <= 1) {
    return this.amount;
  } else if (daysSincePayment <= 7) {
    return this.amount * 0.5;
  }
  
  return 0;
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(doctorId = null, startDate = null, endDate = null) {
  const matchStage = {};
  
  if (doctorId) {
    matchStage.doctor = doctorId;
  }
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  matchStage.status = 'completed';
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalPlatformFees: { $sum: '$platformFee' },
        totalDoctorAmount: { $sum: '$doctorAmount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    totalPlatformFees: 0,
    totalDoctorAmount: 0,
    averageAmount: 0
  };
};

module.exports = mongoose.model('Payment', paymentSchema);
