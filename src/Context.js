import React, { useState } from 'react'

const GameStateContext = React.createContext({})

function ContextWrapper({children}) {
    const [gameState, setGameState] = useState({})
    
    return (
        <GameStateContext.Provider value={[gameState, setGameState]}>
            {children}
        </GameStateContext.Provider>
    )
}

export { GameStateContext, ContextWrapper }