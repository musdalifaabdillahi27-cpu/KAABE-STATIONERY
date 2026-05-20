const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

debtSchema.virtual('pendingAmount').get(function () {
  return Math.max(0, this.totalAmount - this.amountPaid);
});

module.exports = mongoose.model('Debt', debtSchema);
