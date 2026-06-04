const GPSLog = require('../models/GPSLog');
const WorkerAssignment = require('../models/WorkerAssignment');
const Contract = require('../models/Contract');
const { processGPSLocation } = require('../services/gpsService');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    const { role, userId } = socket.handshake.auth || {};

    if (role !== 'contractor' && role !== 'worker') {
      console.warn(`Socket connection rejected: role ${role} not permitted`);
      socket.disconnect(true);
      return;
    }

    socket.on('joinContractRoom', (contractId) => {
      if (role !== 'contractor') return;
      if (!contractId) return;
      socket.join(`contract:${contractId}`);
      console.log(`Contractor ${userId} joined contract room ${contractId}`);
    });

    socket.on('location_update', async ({ contractId, lat, lng, timestamp }) => {
      if (role !== 'worker') return;
      if (!contractId || lat === undefined || lng === undefined) return;

      try {
        const workerName = socket.handshake.auth?.workerName || 'Cleaner';
        await processGPSLocation(io, {
          workerId: userId,
          workerName,
          contractId,
          lat,
          lng,
          timestamp
        });
      } catch (err) {
        console.error('Socket location_update error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
};
