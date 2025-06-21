import { Link } from "react-router-dom";
import PreviousGameSessions from "../components/PreviousGameSessions";
import LeaderBoard from "../components/LeaderBoard";
import { useEffect, useState } from "react";

export default function Home() {
    const [hasCurrentGame, setHasCurrentGame] = useState(false);
    const [currentGameMode, setCurrentGameMode] = useState(null);
    const [currentGameId, setCurrentGameId] = useState(null);

    useEffect(() => {
        const gameStateString = localStorage.getItem("gameState");
        console.log("Raw from localStorage:", gameStateString);
    
        if (gameStateString) {
            try {
                const gameState = JSON.parse(gameStateString);
                setHasCurrentGame(true);
                setCurrentGameMode(gameState.gameMode);
                setCurrentGameId(gameState.roomId);
            } catch (err) {
                console.error("Failed to parse game state:", err);
                setHasCurrentGame(false);
            }
        } else {
            setHasCurrentGame(false);
        }
    }, []);

    return (
        <div className="container ">
            <div className="text-center">
                <p>
                    This is a classic tic-tac-toe game built with the MERN stack. It supports single
                    player mode with "AI" and multiplayer matchmaking mode with Websockets.
                </p>
                <p>Have fun playing!</p>
            </div>
            <div className="text-center py-4">
                <h1 className="text-info mb-3">Select A Game Mode</h1>
                {hasCurrentGame && (
                    <>
                        <p className="text-danger">
                            You have a current game in progress. Please finish it before starting a
                            new game.
                        </p>
                        
                        <Link
                            to={`${currentGameMode === "singleplayer" ? "/game" : `/multiplayer/${currentGameId}`}`}
                            className="btn btn btn-outline-dark"
                        >
                            Resume to Game
                        </Link>
                    </>
                )}

                {!hasCurrentGame && (
                    <div className="d-flex justify-content-center gap-2">
                        <Link to="/new" className="btn btn-lg btn-danger">
                            Single Player (AI)
                        </Link>
                        <Link to="/matchmaking" className="btn btn-lg btn-success">
                            Multiplayer (PvP)
                        </Link>
                    </div>
                )}
            </div>
            <div className="row mt-5 g-5 g-md-3  mb-5">
                <div className="col-12 col-md-6">
                    <PreviousGameSessions />
                </div>
                <div className="col-12 col-md-6">
                    <LeaderBoard />
                </div>
            </div>
        </div>
    );
}
