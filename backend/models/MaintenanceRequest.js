const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Corrective', 'Preventive'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  equipmentCategory: {
    type: String,
    required: true,
    trim: true
  },
  assignedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceTeam',
    required: true
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stage: {
    type: String,
    enum: ['New', 'In Progress', 'Repaired', 'Scrap'],
    default: 'New'
  },
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  actualStartDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

maintenanceRequestSchema.virtual('isOverdue').get(function() {
  if (this.stage === 'New' && this.scheduledDate) {
    return new Date() > this.scheduledDate;
  }
  return false;
});

maintenanceRequestSchema.set('toObject', { virtuals: true });
maintenanceRequestSchema.set('toJSON', { virtuals: true });

maintenanceRequestSchema.pre('save', function(next) {
  if (this.stage === 'In Progress' && !this.actualStartDate) {
    this.actualStartDate = new Date();
  }
  
  if ((this.stage === 'Repaired' || this.stage === 'Scrap') && !this.completionDate) {
    this.completionDate = new Date();
  }
  
  next();
});

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
