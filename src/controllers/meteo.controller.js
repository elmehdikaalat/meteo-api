exports.getLiveData = (req, res) => {
  const { data } = req.query;

  if (!data) {
    return res.status(400).json({
      error_code: 400,
      error_message: 'Missing required parameter: data'
    });
  }

  res.json({
    data: {
      date: new Date().toISOString(),
      location: {
        lat: 48.8566,
        long: 2.3522
      },
      measurements: {
        temperature: {
          unit: '°C',
          value: 18.4
        }
      }
    }
  });
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