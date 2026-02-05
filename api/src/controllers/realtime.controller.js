const { getDb } = require('../db/connection');

exports.streamLiveData = async (req, res) => {
  try {
    const db = getDb();
    const latest = await db.collection('measurements').findOne(
      {}, 
      { sort: { timestamp: -1 } }
    );
    
    const availableMeasurements = latest 
      ? Object.keys(latest.measurements)
      : [];

    res.json({
      message: 'Use WebSocket connection for real-time data',
      endpoint: `ws://${req.get('host')}`,
      availableMeasurements,
      usage: {
        connect: 'const socket = io("ws://localhost:3000")',
        subscribeAll: 'socket.emit("subscribe", {})',
        subscribeSpecific: 'socket.emit("subscribe", { measurements: ["temperature", "humidity"] })',
        receiveEvent: 'socket.on("live-update", (data) => { ... })'
      }
    });
  } catch (error) {
    res.status(500).json({
      error_code: 500,
      error_message: error.message
    });
  }
};