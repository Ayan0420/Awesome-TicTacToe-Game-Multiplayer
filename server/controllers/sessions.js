const GameSession = require("../models/GameSession");

module.exports.saveGameSession = async (req, res) => {
    const newSession = new GameSession(req.body);
    const saved = await newSession.save();
    res.json(saved);
};

module.exports.getSessions = async (req, res) => {
    const sessions = await GameSession.find().sort({ createdAt: -1 });
    res.json(sessions);
};

module.exports.getLeaderBoard = async (req, res) => {
    const leaderBoard = await GameSession.aggregate([
        {
            $match: {
                player2: { $not: { $regex: /^AI-/ } },
                overAllWinner: { $ne: "Draw" },
            }, // only non-AI games and not draws
        },
        {
            $group: {
                _id: "$overAllWinner",
                count: { $sum: 1 },
            },
        },
        {
            $sort: { count: -1 },
        },
    ]);
    // console.log(leaderBoard)
    // if (!leaderBoard.length || (leaderBoard.length > 1 && leaderBoard[0].count === leaderBoard[1].count)) {
    //     return res.json([]);
    // }

    // Add rank based on position in sorted array
    let rank = 1;
    let lastCount = null;
    let offset = 0;

    const rankedLeaderBoard = leaderBoard.map((player, index) => {
        if (player.count !== lastCount) {
            rank = index + 1;
            lastCount = player.count;
        } else {
            offset++;
        }

        return {
            ...player,
            rank,
        };
    });

    // console.log(rankedLeaderBoard);

    res.json(rankedLeaderBoard);
};
