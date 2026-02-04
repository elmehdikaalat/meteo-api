const express = require('express');
const config = require('./config/config');
const meteoRoutes = require('./routes/meteo.routes');
const { connect } = require('./db/connection');

const app = express();

app.use(express.json());
app.use('/meteo/v1', meteoRoutes);

app.use((req, res) => {
  res.status(404).json({
    error_code: 404,
    error_message: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error_code: 500,
    error_message: 'Internal server error'
  });
});

connect().then(() => {
  app.listen(config.PORT, () => {
    console.log(`Meteo API running on port ${config.PORT}`);
  });
}).catch(console.error);