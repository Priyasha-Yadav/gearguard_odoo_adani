const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['CNC Machine', 'Vehicle', 'Computer', 'Printer', 'Other'],
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  maintenanceTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceTeam',
    required: false  // <--- CHANGE THIS TO FALSE
  },
  defaultTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  warrantyExpiry: {
    type: Date
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Operational', 'Under Maintenance', 'Scrap'],
    default: 'Operational'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

equipmentSchema.virtual('openMaintenanceRequests', {
  ref: 'MaintenanceRequest',
  localField: '_id',
  foreignField: 'equipment',
  match: { stage: { $in: ['New', 'In Progress'] } }
});

equipmentSchema.set('toObject', { virtuals: true });
equipmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
