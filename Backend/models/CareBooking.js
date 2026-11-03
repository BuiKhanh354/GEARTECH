const mongoose = require('mongoose');

const CareBookingSchema = new mongoose.Schema({
  bookingCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  deviceType: {
    type: String,
    enum: ['laptop', 'desktop', 'vga', 'other'],
    default: 'laptop'
  },
  servicePackage: {
    type: String,
    enum: ['deep-clean', 'hardware-repair', 'data-recovery', 'care-plus'],
    required: true
  },
  servicePackageName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  issueDescription: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  technicianName: {
    type: String,
    default: '',
    trim: true
  },
  adminNote: {
    type: String,
    default: '',
    trim: true
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CareBooking', CareBookingSchema);

