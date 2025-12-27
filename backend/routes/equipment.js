const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const MaintenanceRequest = require('../models/MaintenanceRequest');

router.get('/', async (req, res) => {
  try {
    const { department, assignedTo, category, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (category) filter.category = category;

    const equipment = await Equipment.find(filter)
      .populate('assignedTo', 'name email')
      .populate('maintenanceTeam', 'name specialization')
      .populate('defaultTechnician', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Equipment.countDocuments(filter);

    res.json({
      equipment,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('assignedTo', 'name email department')
      .populate('maintenanceTeam', 'name specialization members')
      .populate('defaultTechnician', 'name email');

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const openRequests = await MaintenanceRequest.find({
      equipment: req.params.id,
      stage: { $in: ['New', 'In Progress'] }
    }).populate('assignedTechnician', 'name email');

    res.json({
      ...equipment.toObject(),
      openMaintenanceRequests: openRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.post('/', async (req, res) => {
//   try {
//     const equipment = new Equipment(req.body);
//     const savedEquipment = await equipment.save()
//       .then(equip => equip.populate('assignedTo', 'name email')
//         .then(equip => equip.populate('maintenanceTeam', 'name specialization')
//         .then(equip => equip.populate('defaultTechnician', 'name email'))));
    
//     res.status(201).json(savedEquipment);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });



router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };

    Object.keys(data).forEach(key => {
      if (data[key] === "" || data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    });

    if (data.maintenanceFrequency) {
      data.maintenanceFrequency = Number(data.maintenanceFrequency);
    }

    const equipment = new Equipment(data);
    const savedEquipment = await equipment.save();

    const populatedEquipment = await Equipment.findById(savedEquipment._id)
      .populate('assignedTo', 'name email')
      .populate('maintenanceTeam', 'name specialization')
      .populate('defaultTechnician', 'name email');
    
    res.status(201).json(populatedEquipment);
  } catch (error) {
    console.error("DEBUG BACKEND ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
});




router.put('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
      .populate('maintenanceTeam', 'name specialization')
      .populate('defaultTechnician', 'name email');

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const hasOpenRequests = await MaintenanceRequest.exists({
      equipment: req.params.id,
      stage: { $in: ['New', 'In Progress'] }
    });

    if (hasOpenRequests) {
      return res.status(400).json({
        message: 'Cannot delete equipment with open maintenance requests'
      });
    }

    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/maintenance', async (req, res) => {
  try {
    const { stage, page = 1, limit = 10 } = req.query;
    const filter = { equipment: req.params.id };

    if (stage) filter.stage = stage;

    const requests = await MaintenanceRequest.find(filter)
      .populate('assignedTechnician', 'name email')
      .populate('requestedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await MaintenanceRequest.countDocuments(filter);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
