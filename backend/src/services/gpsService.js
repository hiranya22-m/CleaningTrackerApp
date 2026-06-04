const GPSLog = require('../models/GPSLog');
const WorkerAssignment = require('../models/WorkerAssignment');
const Contract = require('../models/Contract');

/**
 * Process a GPS coordinate log for a worker and contract.
 * Performs geofence checks, updates worker assignment stats,
 * saves to GPSLog, and broadcasts real-time socket events.
 */
const processGPSLocation = async (io, { workerId, workerName, contractId, lat, lng, timestamp }) => {
  if (!contractId || lat === undefined || lng === undefined) {
    throw new Error('contractId, lat, and lng are required');
  }

  const assignment = await WorkerAssignment.findOne({
    contractId,
    workerId,
    response: 'accepted'
  }).populate('contractId');

  if (!assignment) {
    throw new Error('GPS tracking is only enabled for accepted active contract assignments');
  }

  const contract = assignment.contractId;
  if (!contract) {
    throw new Error('Associated contract not found');
  }

  const clientLat = contract.location.coordinates.lat;
  const clientLng = contract.location.coordinates.lng;

  // Calculate distance using accurate Haversine Formula
  const R = 6371000; // Earth radius in metres
  const phi1 = (clientLat * Math.PI) / 180;
  const phi2 = (lat * Math.PI) / 180;
  const deltaPhi = ((lat - clientLat) * Math.PI) / 180;
  const deltaLambda = ((lng - clientLng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // in metres

  const previousStatus = assignment.workerStatus;
  let currentStatus = previousStatus;

  // Geofence radius: 50 meters
  const isBreached = distance > 50;

  if (assignment.checkInTime && !assignment.checkOutTime) {
    // Worker has started job — run geofencing checks
    if (isBreached) {
      // Worker is outside work area
      if (previousStatus === 'Working' || previousStatus === 'Arrived' || previousStatus === 'Traveling' || !previousStatus) {
        currentStatus = 'Left Work Area';
        assignment.workerStatus = 'Left Work Area';
        assignment.totalViolations = (assignment.totalViolations || 0) + 1;
        assignment.outsideStartTime = new Date();
        
        // Log violation
        assignment.violationLogs.push({
          timestamp: new Date(),
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          reason: 'Left Work Area'
        });

        // Emit instant Geofence Breach socket alert to contractor
        if (io) {
          io.to(`contract:${contractId}`).emit('geofence_alert', {
            type: 'breach',
            workerId,
            workerName: workerName || 'Cleaner',
            message: `⚠️ WARNING: Worker left the work area! Currently ${Math.round(distance)}m away.`,
            distance,
            timestamp: new Date()
          });
        }
      }
    } else {
      // Worker is inside work area
      if (previousStatus === 'Left Work Area' || previousStatus === 'Traveling' || !previousStatus) {
        currentStatus = 'Working';
        assignment.workerStatus = 'Working';
        
        // Calculate outside breach duration
        if (assignment.outsideStartTime) {
          const diffMs = new Date() - new Date(assignment.outsideStartTime);
          const diffMins = diffMs / 1000 / 60;
          assignment.timeSpentOutsideMinutes = (assignment.timeSpentOutsideMinutes || 0) + diffMins;
          assignment.outsideStartTime = null;
        }

        // Emit Geofence Return socket alert to contractor
        if (io) {
          io.to(`contract:${contractId}`).emit('geofence_alert', {
            type: 'return',
            workerId,
            workerName: workerName || 'Cleaner',
            message: `🛡️ SECURED: Worker returned to the work area.`,
            distance,
            timestamp: new Date()
          });
        }
      } else if (previousStatus === 'Arrived') {
        currentStatus = 'Working';
        assignment.workerStatus = 'Working';
      }
    }
  } else {
    // Job not started yet — traveling or arrived
    if (isBreached) {
      assignment.workerStatus = 'Traveling';
      currentStatus = 'Traveling';
    } else {
      assignment.workerStatus = 'Arrived';
      currentStatus = 'Arrived';
    }
  }

  await assignment.save();

  const log = await GPSLog.create({
    workerId,
    contractId,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    timestamp: timestamp ? new Date(timestamp) : new Date()
  });

  // Calculate dynamic live duration timer parameters
  let workedMins = 0;
  if (assignment.checkInTime) {
    const diffMs = new Date() - new Date(assignment.checkInTime);
    let totalMins = diffMs / 1000 / 60;
    if (assignment.outsideStartTime) {
      const extraOutside = (new Date() - new Date(assignment.outsideStartTime)) / 1000 / 60;
      workedMins = totalMins - (assignment.timeSpentOutsideMinutes || 0) - extraOutside;
    } else {
      workedMins = totalMins - (assignment.timeSpentOutsideMinutes || 0);
    }
  }

  const payload = {
    userId: workerId,
    workerName: workerName || 'Cleaner',
    lat: log.lat,
    lng: log.lng,
    workerStatus: assignment.workerStatus,
    timestamp: log.timestamp,
    distanceToClient: Math.round(distance),
    totalViolations: assignment.totalViolations,
    timeSpentOutsideMinutes: parseFloat((assignment.timeSpentOutsideMinutes || 0).toFixed(2)),
    workedMinutes: Math.max(0, Math.floor(workedMins)),
    checkInTime: assignment.checkInTime
  };

  if (io) {
    io.to(`contract:${contractId}`).emit('worker_location', payload);
  }

  return { log, assignment, payload };
};

module.exports = {
  processGPSLocation
};
