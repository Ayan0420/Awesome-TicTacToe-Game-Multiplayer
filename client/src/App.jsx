import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NewSinglePlayerGame from "./pages/NewSinglePlayerGame";
import GameBoardSingleplayer from "./pages/GameBoardSingleplayer";
import NewMultiPlayerGame from "./pages/NewMultiPlayerGame";
import GameBoardMultiplayer from "./pages/GameBoardMultiplayer";
import SocketProvider from "./context/SocketContext";
import NavBar from "./components/NavBar";

function App() {
    return (
        <SocketProvider>
            <Router>
                <NavBar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/new" element={<NewSinglePlayerGame />} />
                    <Route path="/game" element={<GameBoardSingleplayer />} />
                    <Route path="/matchmaking" element={<NewMultiPlayerGame />} />
                    <Route path="/multiplayer/:roomId" element={<GameBoardMultiplayer />} />
                    <Route path="*" element={
                        <div className="text-center my-5 text-danger">
                            <h1>404 - Page Not Found</h1>
                            <p>The requested page could not be found.</p>
                            
                        </div>
                    } />

                </Routes>
            </Router>
        </SocketProvider>
    );
}

export default App;
