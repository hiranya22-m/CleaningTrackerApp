const express = require('express');
const router = express.Router();
const { createRequest, getRequests, getOffers, acceptOffer, getContractors } = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All client routes require client authentication
router.use(protect);
router.use(authorize('client'));

router.post('/requests', createRequest);
router.get('/requests', getRequests);
router.get('/requests/:id/offers', getOffers);
router.post('/requests/:id/offers/:offerId/accept', acceptOffer);
router.get('/contractors', getContractors);

module.exports = router;
