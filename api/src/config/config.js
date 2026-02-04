module.exports = {
  PORT: process.env.PORT || 3000,
  API_VERSION: 'v1',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017',
  MONGO_DB: process.env.MONGO_DB || 'meteo'
};