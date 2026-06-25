const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // selected workers (can exceed requiredWorkersCount for waitlist)
  requiredWorkersCount: { type: Number, default: 1, required: true },
  isUrgent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'Pending', 'Offer Sent', 'Contractor Assigned', 'Assigned', 'Ongoing', 'Handed Over', 'Completed', 'Cancelled'],
    default: 'Contractor Assigned',
  },
  schedule: {
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., '09:00'
    durationMinutes: { type: Number, required: true },
  },
  notes: { type: String },
  pricePerHour: { type: Number, default: 25 },
  category: { type: String, default: 'Cleaning' },
  handoverDate: { type: Date },
  handoverTime: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Contract', ContractSchema);
