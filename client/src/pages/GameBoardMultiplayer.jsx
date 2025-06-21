// src/pages/MultiplayerGameBoard.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import GameOverPopup from "../components/GameOverPopup";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import env from "../config/env";
import notyf from "../notyf";
import RoundHistory from "../components/RoundHistory";

const initialBoard = Array(9).fill(null);

const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
];

function MultiplayerGameBoard() {
    const { roomId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();

    // Load game state from local storage
    const savedGame = JSON.parse(localStorage.getItem("gameState") || "{}");

    const player1 = state?.playerName || savedGame.player1 || "Player 1";
    const player2 = state?.opponent || savedGame.player2 || "Player 2";
    const playerSymbol = state?.symbol || savedGame.playerSymbol || "X";
    const opponentSymbol = playerSymbol === "X" ? "O" : "X";

    const [board, setBoard] = useState(savedGame.board || initialBoard);
    const [roundResults, setRoundResults] = useState(savedGame.roundResults || []);
    const [scores, setScores] = useState(
        savedGame.scores || { [player1]: 0, [player2]: 0, Draw: 0 }
    );
    const [gameOver, setGameOver] = useState(savedGame.gameOver || false);
    const [winner, setWinner] = useState(savedGame.winner || null);
    const [currentTurn, setCurrentTurn] = useState(savedGame.currentTurn || "X");

    const isPlayerTurn = currentTurn === playerSymbol;

    useEffect(() => {

        // Reconnect to the WebSocket server when the page refreshes
        if(!socket.connected) {
            socket.connect(); 
        }

        socket.emit("joinRoom", { roomId, playerName: player1 });

        socket.on("moveMade", ({ board: newBoard, symbol }) => {
            setBoard(newBoard);
            const result = checkWinner(newBoard);
            if (result) {
                endRound(result);
            } else {
                setCurrentTurn(symbol === "X" ? "O" : "X");
            }
        });

        socket.on("gameReset", () => {
            setBoard(initialBoard);
            setGameOver(false);
            setWinner(null);
            setCurrentTurn("X");
        });

        socket.on("stopGame", (playerName) => {
            notyf.success(`Game Stopped by ${playerName}!`);
            localStorage.removeItem("gameState");
            navigate("/");
        });

        return () => {
            socket.off("moveMade");
            socket.off("gameReset");
            socket.off("stopGame");
        };
    }, []);

    useEffect(() => {
        const data = {
            player1,
            player2,
            playerSymbol,
            board,
            roundResults,
            scores,
            gameOver,
            winner,
            currentTurn,
            gameMode: "multiplayer",
            roomId,
        };

        localStorage.setItem("gameState", JSON.stringify(data));
    }, [
        player1,
        player2,
        playerSymbol,
        board,
        roundResults,
        scores,
        gameOver,
        winner,
        currentTurn,
        roomId,
    ]);

    const checkWinner = (newBoard) => {
        for (let [a, b, c] of winningCombos) {
            if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
                return newBoard[a];
            }
        }
        if (newBoard.every((cell) => cell)) return "Draw";
        return null;
    };

    const endRound = (result) => {
        const winnerName = result === "Draw" ? "Draw" : result === playerSymbol ? player1 : player2;

        setWinner(winnerName);
        setScores((prev) => ({ ...prev, [winnerName]: prev[winnerName] + 1 }));
        setRoundResults((prev) => [...prev, { winner: winnerName }]);
        setGameOver(true);
    };

    const handleClick = (index) => {
        if (!isPlayerTurn || board[index] || gameOver) return;
        socket.emit("makeMove", { roomId, index, symbol: playerSymbol });
    };

    const handleContinue = () => {
        socket.emit("resetGame", roomId);
    };

    const getOverAllWinner = () => {
        const playerScores = Object.entries(scores).filter(([key]) => key !== "Draw");

        if (playerScores.length < 2) return playerScores[0]?.[0] || null;

        const sorted = playerScores.sort((a, b) => b[1] - a[1]); // Descending sort

        if (sorted[0][1] === sorted[1][1]) {
            return "Draw";
        }

        return sorted[0][0]; // Name of the player with the highest score
    };

    const handleStop = async () => {
        await axios.post(`${env.baseUrl}/api/sessions`, {
            player1,
            player2,
            overAllWinner: getOverAllWinner(),
            rounds: roundResults,
        });

        socket.emit("stopGame", { roomId, playerName: player1 });
    };

    const renderCell = (index) => (
        <button
            key={index}
            className={
                "btn btn-outline-dark rounded-0 col-4 p-4 fs-1 m-0 " +
                `${!isPlayerTurn && "bg-dark-subtle"}`
            }
            style={{ height: "100px" }}
            onClick={() => handleClick(index)}
            disabled={!isPlayerTurn || board[index] || gameOver}
        >
            <span className={`fw-bold ${board[index] === "X" ? "text-info" : "text-danger"}`}>
                {board[index]}
            </span>
        </button>
    );

    return (
        <div className="container text-center mt-4">
            <h2 className="d-flex justify-content-center gap-4">
                <span className={`fw-bold ${playerSymbol === "X" ? "text-info" : "text-danger"}`}>
                    {player1} ({playerSymbol})
                </span>{" "}
                vs.
                <span className={`fw-bold ${playerSymbol === "O" ? "text-info" : "text-danger"}`}>
                    {player2} ({opponentSymbol})
                </span>
            </h2>

            <div className="row mt-5 mx-auto" style={{ maxWidth: "700px" }}>
                <div className="col">
                    <h5 className={`${playerSymbol === "X" ? "text-info" : "text-danger"}`}>
                        {player1}:{" "}
                        <span className="fw-bold text-decoration-underline fs-4">
                            {scores[player1]}
                        </span>
                    </h5>
                </div>
                <div className="col">
                    <h5>
                        Draws:{" "}
                        <span className="fw-bold text-decoration-underline fs-4">
                            {scores.Draw}
                        </span>
                    </h5>
                </div>
                <div className="col">
                    <h5 className={`${playerSymbol === "O" ? "text-info" : "text-danger"}`}>
                        {player2}:{" "}
                        <span className="fw-bold text-decoration-underline fs-4">
                            {scores[player2]}
                        </span>
                    </h5>
                </div>
            </div>

            <div className="row row-cols-3 g-2 mt-2 mx-auto" style={{ maxWidth: "300px" }}>
                {Array.from({ length: 9 }, (_, i) => renderCell(i))}
            </div>

            <p className="text-muted mt-3">
                {gameOver
                    ? "Round Over"
                    : isPlayerTurn
                    ? "Your Turn!"
                    : `Waiting for ${player2}'s Turn...`}
            </p>

            <div>
                <button className="btn btn-danger" onClick={handleStop} type="button">
                    Stop Game
                </button>
            </div>

            <div className="mx-auto my-5" style={{ maxWidth: "300px" }}>
                <RoundHistory  rounds={roundResults} />
            </div>

            {gameOver && (
                <GameOverPopup
                    winner={winner}
                    handleContinue={handleContinue}
                    handleStop={handleStop}
                />
            )}
        </div>
    );
}

export default MultiplayerGameBoard;
