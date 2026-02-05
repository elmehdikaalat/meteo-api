const chokidar = require('chokidar');
const fs = require('fs');
const NMEA = require('nmea-simple');
const { MongoClient } = require('mongodb');
const http = require('http');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'meteo';
const API_URL = process.env.API_URL || 'http://meteoapi:3000';

let db;
let measurementsCollection;
let rainEventCount = 0;

async function connect() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  measurementsCollection = db.collection('measurements');
  console.log('Connected to MongoDB');
}

async function notifyAPI(data) {
  try {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'meteoapi',
      port: 3000,
      path: '/meteo/v1/internal/notify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        console.warn('API notification failed:', res.statusCode);
      }
    });
    
    req.on('error', (e) => {
      console.warn('API notification error:', e.message);
    });
    
    req.write(payload);
    req.end();
  } catch (error) {
    console.warn('Failed to notify API:', error.message);
  }
}

async function saveSensorData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const sensorData = JSON.parse(data);

    const gpsData = fs.readFileSync('/dev/shm/gpsNmea', 'utf8');
    const location = parseGPS(gpsData);

    const measurements = {};
    sensorData.measure.forEach(m => {
      measurements[m.name] = {
        value: parseFloat(m.value),
        unit: m.unit
      };
    });

    measurements.rain = {
      value: rainEventCount * 0.2794,
      unit: 'mm'
    };

    const document = {
      timestamp: new Date(),
      location,
      measurements
    };

    await measurementsCollection.insertOne(document);
    console.log('Saved measurement:', document.timestamp, `- Rain events: ${rainEventCount}`);

    rainEventCount = 0;

    await notifyAPI({
      date: document.timestamp,
      location: document.location,
      measurements: document.measurements
    });
  } catch (error) {
    console.error('Error saving sensor data:', error.message);
  }
}

function incrementRainCount() {
  rainEventCount++;
  console.log(`Rain event detected. Total count: ${rainEventCount}`);
}

function parseGPS(data) {
  const lines = data.trim().split('\n');
  let location = { lat: null, long: null };

  lines.forEach(line => {
    try {
      const packet = NMEA.parseNmeaSentence(line);
      if (packet.sentenceId === 'GGA' || packet.sentenceId === 'RMC') {
        location.lat = packet.latitude;
        location.long = packet.longitude;
      }
    } catch (error) {
      console.warn(`Invalid NMEA sentence: ${line.substring(0, 20)}...`);
    }
  });

  return location;
}

async function startWatcher() {
  await connect();

  try {
    const data = fs.readFileSync('/dev/shm/rainCounter.log', 'utf8').trim();
    if (data) {
      const lines = data.split('\n').filter(l => l.length > 0);
      rainEventCount = lines.length;
      console.log(`Initial rain count loaded: ${rainEventCount}`);
    }
  } catch (error) {
    console.log('No initial rain data, starting at 0');
  }

  const sensorsWatcher = chokidar.watch('/dev/shm/sensors', {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  });

  sensorsWatcher.on('change', (path) => {
    console.log('Sensors file changed:', path);
    saveSensorData(path);
  });

  sensorsWatcher.on('add', (path) => {
    console.log('Sensors file added:', path);
    saveSensorData(path);
  });

  const rainWatcher = chokidar.watch('/dev/shm/rainCounter.log', {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 50,
      pollInterval: 50
    }
  });

  rainWatcher.on('change', () => {
    incrementRainCount();
  });

  rainWatcher.on('add', () => {
    incrementRainCount();
  });

  console.log('Watching /dev/shm/sensors and /dev/shm/rainCounter.log...');
}

startWatcher().catch(console.error);


