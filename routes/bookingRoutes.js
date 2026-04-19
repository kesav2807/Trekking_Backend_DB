const express = require('express');
const { getAllBookings, createBooking, updateBookingStatus, sendTicket, sendDigitalTicket, deleteBooking } = require('../controllers/bookingController');

const router = express.Router();

router.get('/', getAllBookings);
router.post('/', createBooking);
router.put('/:id', updateBookingStatus);
router.delete('/:id', deleteBooking);
router.post('/:id/send-ticket', sendTicket);
router.post('/:id/send-digital-ticket', sendDigitalTicket);

module.exports = router;
