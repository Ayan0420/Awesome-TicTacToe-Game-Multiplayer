import { useState } from "react";
import { useNavigate } from "react-router-dom";
import notyf from "../notyf";

export default function NewSinglePlayerGame() {
    const [playerName, setPlayerName] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const navigate = useNavigate();

    const handleStart = () => {
        if (!playerName.trim()) return alert("Please enter your name.");
        navigate("/game", { state: { player1: playerName.trim(), player2: "AI", difficulty } });
        notyf.success("Game started!");
    };

    return (
        <div className="container mt-5 text-center border py-3" style={{ maxWidth: "500px" }}>
            <h2>Start New Game vs AI</h2>
            <div className="form-group mt-4">
                <div className="mx-auto d-flex gap-2" style={{ maxWidth: "400px" }}>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <select
                        className="form-select mb-3"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        style={{ maxWidth: "100px" }}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={handleStart}>
                    Start Game
                </button>
            </div>
        </div>
    );
}
