const express = require('express');
const router = express.Router();
const { getSessions, saveGameSession, getLeaderBoard } = require('../controllers/sessions');

router.get('/', getSessions);
router.get('/leaderboard', getLeaderBoard);
router.post('/', saveGameSession);

module.exports = router;
