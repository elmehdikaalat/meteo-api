module.exports = {
  PORT: process.env.PORT || 3000,
  API_VERSION: 'v1',
  SENSORS_FILE: '/dev/shm/sensors',
  GPS_FILE: '/dev/shm/gpsNmea',
  RAIN_FILE: '/dev/shm/rainCounter.log'
};