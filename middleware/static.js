const express = require('express');

const staticMiddleware = express.static('static');

module.exports = staticMiddleware;