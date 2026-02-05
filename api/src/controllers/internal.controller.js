const { emitLiveData } = require('../services/socketio.service');

exports.notifyNewData = (req, res) => {
  const data = req.body;
  
  if (!data || !data.measurements) {
    return res.status(400).json({
      error_code: 400,
      error_message: 'Invalid data format'
    });
  }

  emitLiveData({
    data: {
      date: data.date,
      location: data.location,
      measurements: data.measurements
    }
  });

  res.status(200).json({ success: true });
};