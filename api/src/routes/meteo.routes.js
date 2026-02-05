const express = require('express');
const router = express.Router();
const meteoController = require('../controllers/meteo.controller');
const realtimeController = require('../controllers/realtime.controller');

router.get('/live', meteoController.getLiveData);
router.get('/archive', meteoController.getArchiveData);

router.get('/realtime', realtimeController.streamLiveData);

module.exports = router;