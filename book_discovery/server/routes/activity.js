const express = require('express');
const router = express.Router();
const { logActivity } = require('../controllers/activityController');

router.post('/', logActivity);

module.exports = router;