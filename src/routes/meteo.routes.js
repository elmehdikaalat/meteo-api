const express = require('express');
const router = express.Router();
const meteoController = require('../controllers/meteo.controller');

router.get('/live', meteoController.getLiveData);
router.get('/archive', meteoController.getArchiveData);

module.exports = router;