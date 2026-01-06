const path = require('path');

module.exports = async (req, res) => {
  const { createApp } = require('../backend/dist/index');
  const app = createApp();
  
  return app(req, res);
};

