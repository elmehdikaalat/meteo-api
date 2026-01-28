const sondeService = require('../services/sonde.service');

exports.getLiveData = (req, res) => {
    const { data } = req.query;

    if (!data) {
        return res.status(400).json({
            error_code: 400,
            error_message: 'Missing required parameter: data'
        });
    }

    try {
        // Parse requested measurements
        const requestedMeasurements = data.split(',').map(m => m.trim());

        // Get location from GPS
        const location = sondeService.parseGPS();

        // Get measurements
        const measurements = {};
        requestedMeasurements.forEach(name => {
            try {
                const measurement = sondeService.getMeasurementByName(name);
                measurements[name] = {
                    unit: measurement.unit,
                    value: parseFloat(measurement.value)
                };
            } catch (error) {
                console.warn(`Measurement '${name}' not found or invalid`);
            }
        });

        // Check if any measurements were found
        if (Object.keys(measurements).length === 0) {
            return res.status(400).json({
                error_code: 400,
                error_message: 'No valid measurements found'
            });
        }

        res.json({
            data: {
                date: new Date().toISOString(),
                location: {
                    lat: location.lat,
                    long: location.long
                },
                measurements
            }
        });
    } catch (error) {
        res.status(500).json({
            error_code: 500,
            error_message: error.message
        });
    }
};

exports.getArchiveData = (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({
            error_code: 400,
            error_message: 'Missing required parameters: start and/or end'
        });
    }

    res.json({
        legend: ['time', 'lat', 'long', 'temperature'],
        unit: ['ISO8601', '°', '°', '°C'],
        data: [
            ['2026-01-28T10:00:00Z', 48.85, 2.35, 17.8],
            ['2026-01-28T11:00:00Z', 48.85, 2.35, 18.1]
        ]
    });
};