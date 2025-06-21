import { useEffect, useState } from "react";
import axios from "axios";
import env from "../config/env";

const PreviousGameSessions = () => {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        axios.get(`${env.baseUrl}/api/sessions`).then((res) => {
            setSessions(res.data);
        });
    }, []);
    return (
        <>
            <h4 className="text-center">Previous Game Sessions</h4>
            <div className="accordion" id="accordionExample">
                {sessions.map((session, index) => (
                    <div key={index} className="accordion-item rounded-0 border-0 border-bottom border-dark">
                        <h2 className="accordion-header" id={`heading-${index}`}>
                            <button
                                className="accordion-button collapsed rounded-0 bg-light"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse-${index}`}
                                aria-expanded="false"
                                aria-controls={`collapse-${index}`}
                            >
                                {session.player2.includes("AI") ? (
                                    <span className="me-1">Single player:</span>
                                ) : (
                                    <span className="me-1">PvP:</span>
                                )}
                                {session.player1} vs {session.player2} - {session.rounds.length}{" "}
                                rounds<span className="vr mx-2"></span>
                                {session.overAllWinner && session.overAllWinner !== "Draw" && (
                                    <span className="fw-bold text-success">
                                        Winner: {session.overAllWinner}
                                    </span>
                                )}
                                {session.overAllWinner && session.overAllWinner === "Draw" && (
                                    <span className="fw-bold text-info">
                                        {session.overAllWinner}
                                    </span>
                                )}
                            </button>
                        </h2>
                        <div
                            id={`collapse-${index}`}
                            className="accordion-collapse collapse"
                            aria-labelledby={`heading-${index}`}
                            data-bs-parent="#accordionExample"
                        >
                            <div className="accordion-body">
                                {session.rounds.map((round, roundIndex) => (
                                    <div key={roundIndex}>
                                        Round {roundIndex + 1}:{" "}
                                        {round.winner === "Draw"
                                            ? "Draw"
                                            : `Winner: ${round.winner}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default PreviousGameSessions;
