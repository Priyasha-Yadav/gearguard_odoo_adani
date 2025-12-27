const mongoose = require('mongoose');

const maintenanceTeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    enum: ['Mechanics', 'Electricians', 'IT Support', 'HVAC', 'General'],
    trim: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['Team Lead', 'Senior Technician', 'Technician'],
      default: 'Technician'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  contactEmail: {
    type: String,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

maintenanceTeamSchema.virtual('openRequests', {
  ref: 'MaintenanceRequest',
  localField: '_id',
  foreignField: 'assignedTeam',
  match: { stage: { $in: ['New', 'In Progress'] } }
});

maintenanceTeamSchema.set('toObject', { virtuals: true });
maintenanceTeamSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MaintenanceTeam', maintenanceTeamSchema);
