const GameOverPopup = ({ winner, handleContinue, handleStop }) => {
    const message = winner === "Draw" ? "It's a draw!" : `${winner} wins this round!`;

    return (
        <div className="popup-overlay">
            <div className="popup">
                <h3 className="popup-message">{message}</h3>
                <div className="button-group">
                    <button className="btn btn-primary m-2" onClick={handleContinue}>
                        Another Round
                    </button>
                    <button className="btn btn-danger m-2" onClick={handleStop}>
                        Stop Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameOverPopup;
