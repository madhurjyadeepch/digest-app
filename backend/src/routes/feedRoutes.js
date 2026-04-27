const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController.js');

route.get('/', feedController.getFeed);

module.exports = router;