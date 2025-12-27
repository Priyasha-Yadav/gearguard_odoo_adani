const express = require('express');
const router = express.Router();
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Equipment = require('../models/Equipment');

router.get('/', async (req, res) => {
  try {
    const { 
      stage, 
      type, 
      priority, 
      assignedTeam, 
      assignedTechnician,
      equipment,
      startDate,
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};
    
    if (stage) filter.stage = stage;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (assignedTeam) filter.assignedTeam = assignedTeam;
    if (assignedTechnician) filter.assignedTechnician = assignedTechnician;
    if (equipment) filter.equipment = equipment;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const requests = await MaintenanceRequest.find(filter)
      .populate('equipment', 'name serialNumber category location')
      .populate('assignedTeam', 'name specialization')
      .populate('assignedTechnician', 'name email')
      .populate('requestedBy', 'name email department')
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

router.get('/kanban', async (req, res) => {
  try {
    const { assignedTeam, assignedTechnician } = req.query;
    
    const filter = {};
    if (assignedTeam) filter.assignedTeam = assignedTeam;
    if (assignedTechnician) filter.assignedTechnician = assignedTechnician;

    const stages = ['New', 'In Progress', 'Repaired', 'Scrap'];
    const kanbanData = {};

    for (const stage of stages) {
      const stageFilter = { ...filter, stage };
      const requests = await MaintenanceRequest.find(stageFilter)
        .populate('equipment', 'name serialNumber category')
        .populate('assignedTechnician', 'name email')
        .populate('requestedBy', 'name email')
        .sort({ createdAt: -1 });
      
      kanbanData[stage] = requests;
    }

    res.json(kanbanData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/calendar', async (req, res) => {
  try {
    const { start, end, assignedTeam } = req.query;
    
    const filter = { 
      type: 'Preventive',
      scheduledDate: { $exists: true }
    };
    
    if (assignedTeam) filter.assignedTeam = assignedTeam;
    
    if (start && end) {
      filter.scheduledDate = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const requests = await MaintenanceRequest.find(filter)
      .populate('equipment', 'name serialNumber category location')
      .populate('assignedTeam', 'name specialization')
      .populate('assignedTechnician', 'name email')
      .sort({ scheduledDate: 1 });

    const calendarEvents = requests.map(request => ({
      id: request._id,
      title: `${request.subject} - ${request.equipment.name}`,
      start: request.scheduledDate,
      extendedProps: {
        equipment: request.equipment,
        team: request.assignedTeam,
        technician: request.assignedTechnician,
        priority: request.priority,
        stage: request.stage
      }
    }));

    res.json(calendarEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('equipment', 'name serialNumber category location department')
      .populate('assignedTeam', 'name specialization members')
      .populate('assignedTechnician', 'name email department')
      .populate('requestedBy', 'name email department')
      .populate('notes.addedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.post('/', async (req, res) => {
//   try {
//     const { equipment, ...requestData } = req.body;
    
//     const equipmentData = await Equipment.findById(equipment);
//     if (!equipmentData) {
//       return res.status(400).json({ message: 'Equipment not found' });
//     }

//     const request = new MaintenanceRequest({
//       ...requestData,
//       equipmentCategory: equipmentData.category,
//       assignedTeam: equipmentData.maintenanceTeam
//     });

//     const savedRequest = await request.save()
//       .then(req => req.populate('equipment', 'name serialNumber category')
//         .then(req => req.populate('assignedTeam', 'name specialization')
//         .then(req => req.populate('assignedTechnician', 'name email')
//         .then(req => req.populate('requestedBy', 'name email')))));
    
//     res.status(201).json(savedRequest);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });


router.post('/', async (req, res) => {
  try {
    const { equipment, ...requestData } = req.body;
    
    // 1. CLEANUP: Remove ANY field that is an empty string ("")
    // This prevents BSON errors for ObjectIDs and "Invalid Date" for scheduledDate
    Object.keys(requestData).forEach(key => {
      if (requestData[key] === "" || requestData[key] === null) {
        delete requestData[key];
      }
    });

    const equipmentData = await Equipment.findById(equipment);
    if (!equipmentData) {
      return res.status(400).json({ message: 'Equipment not found' });
    }

    // 2. Create the request
    const request = new MaintenanceRequest({
      ...requestData,
      equipment, // Ensure the ID is passed
      equipmentCategory: equipmentData.category,
      // Only assign the team if it wasn't manually selected in the form
      assignedTeam: requestData.assignedTeam || equipmentData.maintenanceTeam
    });

    // 3. Save and Populate
    const savedRequest = await request.save();
    
    const populatedRequest = await MaintenanceRequest.findById(savedRequest._id)
      .populate('equipment', 'name serialNumber category')
      .populate('assignedTeam', 'name specialization')
      .populate('assignedTechnician', 'name email')
      .populate('requestedBy', 'name email');
    
    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error("Backend Error:", error.message);
    res.status(400).json({ message: error.message });
  }
});



router.put('/:id', async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('equipment', 'name serialNumber category')
     .populate('assignedTeam', 'name specialization')
     .populate('assignedTechnician', 'name email')
     .populate('requestedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/stage', async (req, res) => {
  try {
    const { stage, duration } = req.body;
    
    const updateData = { stage };
    if (duration !== undefined) updateData.duration = duration;

    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('equipment', 'name serialNumber category')
     .populate('assignedTeam', 'name specialization')
     .populate('assignedTechnician', 'name email')
     .populate('requestedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/notes', async (req, res) => {
  try {
    const { content, addedBy } = req.body;
    
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    request.notes.push({ content, addedBy });
    await request.save();
    
    const updatedRequest = await MaintenanceRequest.findById(req.params.id)
      .populate('equipment', 'name serialNumber category')
      .populate('assignedTeam', 'name specialization')
      .populate('assignedTechnician', 'name email')
      .populate('requestedBy', 'name email')
      .populate('notes.addedBy', 'name email');

    res.status(201).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/stats/dashboard', async (req, res) => {
  try {
    const stats = {
      total: await MaintenanceRequest.countDocuments(),
      new: await MaintenanceRequest.countDocuments({ stage: 'New' }),
      inProgress: await MaintenanceRequest.countDocuments({ stage: 'In Progress' }),
      repaired: await MaintenanceRequest.countDocuments({ stage: 'Repaired' }),
      scrap: await MaintenanceRequest.countDocuments({ stage: 'Scrap' }),
      preventive: await MaintenanceRequest.countDocuments({ type: 'Preventive' }),
      corrective: await MaintenanceRequest.countDocuments({ type: 'Corrective' }),
      overdue: await MaintenanceRequest.countDocuments({
        stage: 'New',
        scheduledDate: { $lt: new Date() }
      })
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
