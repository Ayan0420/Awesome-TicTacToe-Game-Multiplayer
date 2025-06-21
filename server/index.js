const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const server = http.createServer(app); // Attach http server
const io = new Server(server, {
    cors: {
        origin: "*", // You can restrict this in prod
        methods: ["GET", "POST"],
    },
});

// Express middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
});

// Express routes
app.use("/api/sessions", require("./routes/sessions"));

// Matchmaking queue
const queue = [];
const games = {}; // roomId => { board, players }

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on('joinQueue', (playerName) => {
        // Check if player name already exists
        const existingPlayer = queue.find(player => player.playerName === playerName);
    
        if (existingPlayer) {
          console.log(`Duplicate name attempt: ${playerName}`);
          return socket.emit('error', 'Player name already exists in the queue. Please choose a different name.');
        }
    
        // Only add to queue if name is unique
        queue.push({ socket, playerName });
        console.log(`${playerName} joined the queue.`);
    
        // Matchmaking
        if (queue.length >= 2) {
          const player1 = queue.shift();
          const player2 = queue.shift();
          const roomId = uuidv4();
    
          console.log(`Match found between ${player1.playerName} and ${player2.playerName}. Room ID: ${roomId}`);
    
          games[roomId] = {
            board: Array(9).fill(null),
            players: [player1.playerName, player2.playerName],
          };
    
          player1.socket.join(roomId);
          player2.socket.join(roomId);
    
          player1.socket.emit('matchFound', {
            roomId,
            playerName: player1.playerName,
            opponent: player2.playerName,
            symbol: 'X',
          });
    
          player2.socket.emit('matchFound', {
            roomId,
            playerName: player2.playerName,
            opponent: player1.playerName,
            symbol: 'O',
          });
    
          io.to(roomId).emit('playersUpdate', games[roomId].players);
        }
      });

    socket.on("makeMove", ({ roomId, index, symbol }) => {
        // console.log(`Player ${symbol} made a move at index ${index} in room ${roomId}`);
        const game = games[roomId];
        if (game && game.board[index] === null) {
            game.board[index] = symbol;
            io.to(roomId).emit("moveMade", { board: game.board, index, symbol });
        }
    });

    socket.on("resetGame", (roomId) => {
        if (games[roomId]) {
            games[roomId].board = Array(9).fill(null);
            io.to(roomId).emit("gameReset");
        }
    });

    socket.on("joinRoom", ({ roomId, playerName }) => {
        console.log(`Player ${playerName} joined room ${roomId}`);
        socket.join(roomId);
    });

    socket.on("stopGame", ({ roomId, playerName }) => {
        io.to(roomId).emit("stopGame", playerName);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        // Optionally remove player from queue if still waiting
        const idx = queue.findIndex((p) => p.socket.id === socket.id);
        if (idx !== -1) queue.splice(idx, 1);
    });
});

// Start both http + WebSocket server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server + Socket.io running on port ${PORT}`));
