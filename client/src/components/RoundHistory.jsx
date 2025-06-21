import React from 'react'

const RoundHistory = ({rounds}) => {
  return (
    <div>
        <h4>Winner History</h4>
        <ul className="list-group">
            {rounds.map((round, index) => (
                <li className="list-group-item" key={index}>Round {index + 1}: <span className="fw-bold fs-4 text-success">{round.winner}</span></li>
            )).sort((a, b) => b.key - a.key)}
        </ul>
    </div>
  )
}

export default RoundHistory