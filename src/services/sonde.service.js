const fs = require('fs');
const NMEA = require('nmea-simple');
const config = require('../config/config');


exports.readSensors = () => {
    try {
        const data = fs.readFileSync(config.SENSORS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Failed to read sensors: ${error.message}`);
    }
};

// Get single measurement by name
exports.getMeasurementByName = (name) => {
    const sensorData = this.readSensors();
    const measurement = sensorData.measure.find(m => m.name === name);

    if (!measurement) {
        throw new Error(`Measurement '${name}' not found`);
    }

    return measurement;
};


exports.readGPS = () => {
  try {
    const data = fs.readFileSync(config.GPS_FILE, 'utf8');
    return data.trim().split('\n');
  } catch (error) {
    throw new Error(`Failed to read GPS: ${error.message}`);
  }
};

// Read GPS data from file
exports.parseGPS = () => {
  const lines = exports.readGPS();
  let location = { lat: null, long: null };
  
  lines.forEach(line => {
    try {
      const packet = NMEA.parseNmeaSentence(line);
      if (packet.sentenceId === 'GGA' || packet.sentenceId === 'RMC') {
        location.lat = packet.latitude;
        location.long = packet.longitude;
      }
    } catch (error) {
      console.warn(`Invalid NMEA sentence: ${line}`);
    }
  });
  
  return location;
};