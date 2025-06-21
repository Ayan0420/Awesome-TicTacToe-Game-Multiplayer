// src/pages/Queue.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import notyf from "../notyf";

function NewMultiPlayerGame() {
    const [name, setName] = useState("");
    const [waiting, setWaiting] = useState(false);
    const navigate = useNavigate();
    const socket = useSocket();

    useEffect(() => {
        const storedPlayerName = localStorage.getItem("playerName");
        if (storedPlayerName) {
            setName(storedPlayerName);
        }
    }, []);

    useEffect(() => {
        socket.connect(); // Connect to the WebSocket server

        socket.on("matchFound", ({ roomId, playerName, opponent, symbol }) => {
            console.log("symbol received", symbol);
            navigate(`/multiplayer/${roomId}`, {
                state: { playerName, opponent, symbol },
            });
            notyf.success(`Match found with ${opponent}!`);
        });

        socket.on("error", (message) => {
            setWaiting(false);
            notyf.error(message);
        });

        return () => {
            socket.off("matchFound");
            socket.off("error");
        };
    }, [navigate]);

    const handleJoinQueue = () => {
        if (!name.trim()) return;
        setWaiting(true);
        socket.emit("joinQueue", name.trim());
        localStorage.setItem("playerName", name);
    };

    return (
        <>
            <div
                className="container mt-5 text-center border rounded-1 py-3"
                style={{ maxWidth: "500px" }}
            >
                <h3>Enter your name to find a match</h3>
                <input
                    className="form-control mx-auto mt-3"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={waiting}
                    style={{ maxWidth: "400px" }}
                />
                <button
                    className="btn btn-primary mt-3"
                    onClick={handleJoinQueue}
                    disabled={waiting}
                >
                    {waiting ? "Searching for opponent..." : "Find Match"}
                </button>
            </div>

            <p className="text-center mt-5 text-muted w-50 mx-auto">
                Note: To demonstrate multiplayer game (if no other player is found), open this app
                in a different browser or in incognito mode for the other player.
            </p>
        </>
    );
}

export default NewMultiPlayerGame;
