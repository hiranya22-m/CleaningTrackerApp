const express = require('express');
const router = express.Router();
const {
  getAssignments,
  respondToAssignment,
  getNotifications,
  markNotificationRead,
  startAssignmentJob,
  endAssignmentJob,
  getFreelanceJobsForWorker,
  applyForFreelanceJob,
  getAssociatedContractors,
  getContractorProjectsForWorker
} = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All worker routes require worker authorization
router.use(protect);
router.use(authorize('worker'));

router.get('/assignments', getAssignments);
router.post('/assignments/:id/respond', respondToAssignment);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.post('/assignments/:id/start', startAssignmentJob);
router.post('/assignments/:id/end', endAssignmentJob);

// Freelance & Contractors
router.get('/freelance', getFreelanceJobsForWorker);
router.post('/freelance/:id/apply', applyForFreelanceJob);
router.get('/contractors', getAssociatedContractors);
router.get('/contractors/:id/projects', getContractorProjectsForWorker);

module.exports = router;
