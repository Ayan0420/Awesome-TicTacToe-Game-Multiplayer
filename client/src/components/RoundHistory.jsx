import React from 'react'

const RoundHistory = ({rounds}) => {
  return (
    <div>
        <ul>
            {rounds.map((round, index) => (
                <li key={index}>{round}</li>
            ))}
        </ul>
    </div>
  )
}

export default RoundHistory