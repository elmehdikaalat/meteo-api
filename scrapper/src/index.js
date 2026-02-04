const chokidar = require('chokidar');
const fs = require('fs');
const NMEA = require('nmea-simple');
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'meteo';

let db;
let measurementsCollection;

async function connect() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  measurementsCollection = db.collection('measurements');
  console.log('Connected to MongoDB');
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
    
    const document = {
      timestamp: new Date(),
      location,
      measurements
    };
    
    await measurementsCollection.insertOne(document);
    console.log('Saved measurement:', document.timestamp);
  } catch (error) {
    console.error('Error saving sensor data:', error.message);
  }
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
  
  const watcher = chokidar.watch('/dev/shm/sensors', {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  });
  
  watcher.on('change', (path) => {
    console.log('File changed:', path);
    saveSensorData(path);
  });
  
  watcher.on('add', (path) => {
    console.log('File added:', path);
    saveSensorData(path);
  });
  
  console.log('Watching /dev/shm/sensors...');
}

startWatcher().catch(console.error);