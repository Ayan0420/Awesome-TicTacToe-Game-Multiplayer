const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  player1: String,
  player2: String,
  rounds: [
    {
      winner: String,  // "Draw", "Player 1", or "Player 2"
    }
  ],
  overAllWinner: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GameSession', gameSessionSchema);
