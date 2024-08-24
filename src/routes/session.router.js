const express = require('express');
const router = express.Router();

const sessionController = require('../controllers/session.controller');

router.post('/start', sessionController.startSession);
router.post('/stop', sessionController.stopSession);
router.post('/list', sessionController.listSessions);

module.exports = router;
