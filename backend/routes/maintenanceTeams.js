const express = require('express');
const router = express.Router();
const MaintenanceTeam = require('../models/MaintenanceTeam');
const MaintenanceRequest = require('../models/MaintenanceRequest');

router.get('/', async (req, res) => {
  try {
    const { specialization, isActive, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (specialization) filter.specialization = specialization;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const teams = await MaintenanceTeam.find(filter)
      .populate('members.user', 'name email role department')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await MaintenanceTeam.countDocuments(filter);

    res.json({
      teams,
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
    const team = await MaintenanceTeam.findById(req.params.id)
      .populate('members.user', 'name email role department')
      .populate('members.user', 'name email role department');

    if (!team) {
      return res.status(404).json({ message: 'Maintenance team not found' });
    }

    const openRequests = await MaintenanceRequest.find({
      assignedTeam: req.params.id,
      stage: { $in: ['New', 'In Progress'] }
    }).populate('equipment', 'name serialNumber')
     .populate('assignedTechnician', 'name email');

    res.json({
      ...team.toObject(),
      openRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const team = new MaintenanceTeam(req.body);
    const savedTeam = await team.save()
      .then(t => t.populate('members.user', 'name email role department'));
    
    res.status(201).json(savedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const team = await MaintenanceTeam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('members.user', 'name email role department');

    if (!team) {
      return res.status(404).json({ message: 'Maintenance team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const hasOpenRequests = await MaintenanceRequest.exists({
      assignedTeam: req.params.id,
      stage: { $in: ['New', 'In Progress'] }
    });

    if (hasOpenRequests) {
      return res.status(400).json({ 
        message: 'Cannot delete team with open maintenance requests' 
      });
    }

    const team = await MaintenanceTeam.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Maintenance team not found' });
    }

    res.json({ message: 'Maintenance team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/members', async (req, res) => {
  try {
    const { user, role } = req.body;
    
    const team = await MaintenanceTeam.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Maintenance team not found' });
    }

    const existingMember = team.members.find(
      member => member.user.toString() === user
    );

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    team.members.push({ user, role });
    await team.save();
    
    const updatedTeam = await MaintenanceTeam.findById(req.params.id)
      .populate('members.user', 'name email role department');

    res.status(201).json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const team = await MaintenanceTeam.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Maintenance team not found' });
    }

    team.members = team.members.filter(
      member => member.user.toString() !== req.params.userId
    );
    
    await team.save();
    
    const updatedTeam = await MaintenanceTeam.findById(req.params.id)
      .populate('members.user', 'name email role department');

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/requests', async (req, res) => {
  try {
    const { stage, page = 1, limit = 10 } = req.query;
    const filter = { assignedTeam: req.params.id };
    
    if (stage) filter.stage = stage;

    const requests = await MaintenanceRequest.find(filter)
      .populate('equipment', 'name serialNumber category')
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
