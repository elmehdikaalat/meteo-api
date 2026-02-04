const { getDb } = require('../db/connection');

exports.getLiveData = async (req, res) => {
  const { data } = req.query;

  if (!data) {
    return res.status(400).json({
      error_code: 400,
      error_message: 'Missing required parameter: data'
    });
  }

  try {
    const db = getDb();
    const collection = db.collection('measurements');
    
    const latest = await collection.findOne(
      {}, 
      { sort: { timestamp: -1 } }
    );
    
    if (!latest) {
      return res.status(404).json({
        error_code: 404,
        error_message: 'No data available'
      });
    }
    
    const requestedMeasurements = data.split(',').map(m => m.trim());
    const measurements = {};
    
    requestedMeasurements.forEach(name => {
      if (latest.measurements[name]) {
        measurements[name] = latest.measurements[name];
      }
    });
    
    if (Object.keys(measurements).length === 0) {
      return res.status(400).json({
        error_code: 400,
        error_message: 'No valid measurements found'
      });
    }
    
    res.json({
      data: {
        date: latest.timestamp,
        location: latest.location,
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

exports.getArchiveData = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({
      error_code: 400,
      error_message: 'Missing required parameters: start and/or end'
    });
  }

  try {
    const db = getDb();
    const collection = db.collection('measurements');
    
    const startDate = new Date(parseInt(start) * 1000);
    const endDate = new Date(parseInt(end) * 1000);
    
    const documents = await collection.find({
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 }).toArray();
    
    const legend = ['time', 'lat', 'long'];
    const unit = ['ISO8601', '°', '°'];
    const data = [];
    
    if (documents.length > 0) {
      Object.keys(documents[0].measurements).forEach(key => {
        legend.push(key);
        unit.push(documents[0].measurements[key].unit);
      });
    }
    
    documents.forEach(doc => {
      const row = [
        doc.timestamp.toISOString(),
        doc.location.lat,
        doc.location.long
      ];
      
      legend.slice(3).forEach(key => {
        row.push(doc.measurements[key]?.value || null);
      });
      
      data.push(row);
    });
    
    res.json({ legend, unit, data });
  } catch (error) {
    res.status(500).json({
      error_code: 500,
      error_message: error.message
    });
  }
};