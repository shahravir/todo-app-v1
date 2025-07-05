var express = require('express');
var router = express.Router();

// Health check
router.get('/', function(req, res, next) {
  res.json({ status: 'ok' });
});

module.exports = router;
