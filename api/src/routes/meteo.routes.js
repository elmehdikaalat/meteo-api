const express = require('express');
const router = express.Router();
const meteoController = require('../controllers/meteo.controller');
const realtimeController = require('../controllers/realtime.controller');
const internalController = require('../controllers/internal.controller');


router.get('/live', meteoController.getLiveData);
router.get('/archive', meteoController.getArchiveData);

router.get('/realtime', realtimeController.streamLiveData);

router.post('/internal/notify', internalController.notifyNewData);

module.exports = router;