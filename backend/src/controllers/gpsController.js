const GPSLog = require('../models/GPSLog');
const Contract = require('../models/Contract');
const WorkerAssignment = require('../models/WorkerAssignment');
const { processGPSLocation } = require('../services/gpsService');

// POST /api/gps/log - Worker logs GPS during active contract job
exports.logGps = async (req, res) => {
  try {
    const { contractId, lat, lng } = req.body;

    if (!contractId || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'contractId, lat, and lng are required' });
    }

    const io = req.app.get('socketio');
    const result = await processGPSLocation(io, {
      workerId: req.user.id,
      workerName: req.user.name,
      contractId,
      lat,
      lng
    });

    res.status(201).json({ success: true, log: result.log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/gps/contract/:contractId - Contractor views GPS history for their contract
exports.getContractGpsHistory = async (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (contract.contractorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this contract GPS data' });
    }

    const logs = await GPSLog.find({ contractId })
      .populate('workerId', 'name email status')
      .sort('-timestamp')
      .limit(200);

    const assignments = await WorkerAssignment.find({ contractId, response: 'accepted' })
      .populate('workerId', 'name email status');

    res.json({ success: true, logs, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
