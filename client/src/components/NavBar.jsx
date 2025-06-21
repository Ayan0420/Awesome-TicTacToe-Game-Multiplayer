import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
    return (
        <div className="py-3 text-center">
            <Link to="/" className="text-decoration-none"><h1 className="display-3 text-warning">Awesome Tic Tac Toe Game</h1></Link>
            
        </div>
    );
};

export default NavBar;
