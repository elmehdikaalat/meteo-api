const { MongoClient } = require('mongodb');
const config = require('../config/config');


const MONGO_URI = config.MONGO_URI;
const DB_NAME = config.MONGO_DB;

let db;
let client;

async function connect() {
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  
  await db.collection('measurements').createIndex({ timestamp: -1 });
  await db.collection('measurements').createIndex({ 
    'location.lat': 1, 
    'location.long': 1 
  });
  
  console.log('API connected to MongoDB');
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

async function close() {
  if (client) {
    await client.close();
  }
}

module.exports = { connect, getDb, close };