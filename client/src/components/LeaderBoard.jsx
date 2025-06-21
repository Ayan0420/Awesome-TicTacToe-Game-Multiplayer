import axios from "axios";
import { useEffect, useState } from "react";
import env from "../config/env";

const LeaderBoard = () => {
    const [leaderBoard, setLeaderBoard] = useState([]);

    useEffect(() => {
        axios.get(`${env.baseUrl}/api/sessions/leaderboard`).then((res) => {
            // console.log(res);
            setLeaderBoard(res.data);
        });
    }, []);

    return (
        <>
            <h4 className="text-center">PvP Leaderboard</h4>
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">Rank</th>
                        <th scope="col">Player</th>
                        <th scope="col">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderBoard.map((player, index) => (
                        <tr key={index}>
                            <th scope="row">{player.rank}</th>
                            <td>{player._id}</td>
                            <td>{player.count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default LeaderBoard;
