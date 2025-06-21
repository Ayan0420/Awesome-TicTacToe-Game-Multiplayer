import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import GameOverPopup from "../components/GameOverPopup";
import env from "../config/env";
import notyf from "../notyf";

const initialBoard = Array(9).fill(null);

function GameBoard() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const player1 = state?.player1 || "Player 1";
    const ai = "AI";
    const difficulty = state?.difficulty || "easy";

    // Load game state from local storage
    const savedGame = JSON.parse(localStorage.getItem("gameState") || "{}");
    
    const [board, setBoard] = useState(savedGame.board || initialBoard);
    const [roundResults, setRoundResults] = useState(savedGame.roundResults || []);
    const [isAITurn, setIsAITurn] = useState(savedGame.isAITurn || false);
    const [scores, setScores] = useState(savedGame.scores || { [player1]: 0, [ai]: 0, Draw: 0 });
    const [gameOver, setGameOver] = useState(savedGame.gameOver || false);
    const [winner, setWinner] = useState(savedGame.winner || null);

    const winningCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // rows
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // columns
        [0, 4, 8],
        [2, 4, 6], // diagonals
    ];

    useEffect(() => {
        const data = {
            board,
            roundResults,
            isAITurn,
            scores,
            gameOver,
            winner,
            gameMode: "singleplayer",
        };
        localStorage.setItem("gameState", JSON.stringify(data));
    }, [board, roundResults, isAITurn, scores, gameOver, winner]);

    const checkWinner = (newBoard) => {
        for (let [a, b, c] of winningCombos) {
            if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
                return newBoard[a];
            }
        }
        if (newBoard.every((cell) => cell)) return "Draw";
        return null;
    };

    const getAIMove = (newBoard, difficulty) => {
        const emptyIndices = newBoard
            .map((v, i) => (v === null ? i : null))
            .filter((i) => i !== null);

        const winOrBlock = () => {
            for (let [a, b, c] of winningCombos) {
                const line = [newBoard[a], newBoard[b], newBoard[c]];
                const idx = [a, b, c];
                const count = (val) => line.filter((x) => x === val).length;
                if (count("O") === 2 && count(null) === 1) return idx[line.indexOf(null)];
                if (count("X") === 2 && count(null) === 1) return idx[line.indexOf(null)];
            }
            return null;
        };

        const minimax = (board, isMaximizing) => {
            const winner = checkWinner(board);
            if (winner === "O") return { score: 1 };
            if (winner === "X") return { score: -1 };
            if (winner === "Draw") return { score: 0 };

            const moves = [];
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    const newBoard = [...board];
                    newBoard[i] = isMaximizing ? "O" : "X";
                    const result = minimax(newBoard, !isMaximizing);
                    moves.push({ index: i, score: result.score });
                }
            }

            return isMaximizing
                ? moves.reduce((best, move) => (move.score > best.score ? move : best))
                : moves.reduce((best, move) => (move.score < best.score ? move : best));
        };

        if (difficulty === "easy") {
            return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }

        if (difficulty === "medium") {
            return winOrBlock() ?? emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }

        if (difficulty === "hard") {
            const bestMove = minimax(newBoard, true);
            return bestMove.index;
        }

        return emptyIndices[0]; // Fallback
    };

    const endRound = (winnerName) => {
        setWinner(winnerName);
        setScores((prev) => ({ ...prev, [winnerName]: prev[winnerName] + 1 }));
        setRoundResults((prev) => [...prev, { winner: winnerName }]);
        setGameOver(true);
    };

    const handleClick = (index) => {
        if (board[index] || gameOver) return;

        const newBoard = [...board];
        newBoard[index] = "X";
        setBoard(newBoard);

        const result = checkWinner(newBoard);
        if (result) return endRound(result === "Draw" ? "Draw" : player1);

        setIsAITurn(true);

        setTimeout(() => {
            const aiMove = getAIMove(newBoard, difficulty);
            newBoard[aiMove] = "O";
            setBoard([...newBoard]);

            const aiResult = checkWinner(newBoard);
            if (aiResult) endRound(aiResult === "Draw" ? "Draw" : ai);

            setIsAITurn(false);
        }, 500);
    };

    const handleContinue = () => {
        setBoard(initialBoard);
        setWinner(null);
        setGameOver(false);
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
            player2: `${ai}-${difficulty}`,
            overAllWinner: getOverAllWinner(),
            rounds: roundResults,
        });
        notyf.success(`Game Stopped by ${player1}!`);
        localStorage.removeItem("gameState");
        navigate("/");
    };

    const renderCell = (index) => (
        <button
            key={index}
            className={`btn btn-outline-dark rounded-0 col-4 p-4 fs-1 m-0 ${
                isAITurn && "disabled"
            }`}
            style={{
                height: "100px",
            }}
            onClick={() => handleClick(index)}
        >
            <span className={`fw-bold ${board[index] === "X" ? "text-info" : "text-danger"}`}>
                {board[index]}
            </span>
        </button>
    );

    return (
        <div className="container text-center mt-4">
            <h2 className="d-flex justify-content-center gap-4">
                <span className="fw-bold text-info">{player1} (X)</span> vs.
                <span className="fw-bold text-danger">
                    {ai} {difficulty} (O)
                </span>
            </h2>
            <div className="row mt-5 mx-auto" style={{ maxWidth: "700px" }}>
                <div className="col">
                    <h5 className="text-info">
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
                            {scores["Draw"]}
                        </span>
                    </h5>
                </div>
                <div className="col">
                    <h5 className="text-danger">
                        {ai}:{" "}
                        <span className="fw-bold text-decoration-underline fs-4">{scores[ai]}</span>
                    </h5>
                </div>
            </div>

            <div className="row row-cols-3 g-2 mt-2 mx-auto" style={{ maxWidth: "300px" }}>
                {Array.from({ length: 9 }, (_, i) => renderCell(i))}
            </div>

            {isAITurn ? (
                <p className="text-muted mt-3">AI is thinking...</p>
            ) : (
                <p className="text-muted mt-3">Your Turn!</p>
            )}

            <div className="">
                <button className="btn btn-danger" onClick={handleStop} type="button">
                    Stop Game
                </button>
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

export default GameBoard;
