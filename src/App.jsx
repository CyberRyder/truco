import { useState, useEffect } from 'react'
import './App.css'
import { socket } from './socket';

export default function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);

  const [gameState, setGameState] = useState({
    // Game status
    isStarted: false,
    
    // Players
    playerOne: {
      hand: [],
      playStack: [],
      trickScore: 0,
      roundScore: 0
    },
    playerTwo: {
      hand: [],
      playStack: [],
      trickScore: 0,
      roundScore: 0
    },
    
    // Game elements
    divaCard: null,
    manilhas: [],
    trick: 1,
    deck: JSON.parse(JSON.stringify(startingDeck)),
    
    // Betting
    bet: { value: 1, player: null },
    betStack: { value: 0, player: null },
    
    // Game log
    gameLog: []
  })

  // Helper functions to update specific parts of the state
  const updateGameState = (updates) => {
    setGameState(prevState => ({ ...prevState, ...updates }))
  }

  const updatePlayer = (playerNumber, updates) => {
    const playerKey = playerNumber === 1 ? 'playerOne' : 'playerTwo'
    setGameState(prevState => ({
      ...prevState,
      [playerKey]: {
        ...prevState[playerKey],
        ...updates
      }
    }))
  }

  const addToGameLog = (message) => {
    setGameState(prevState => ({
      ...prevState,
      gameLog: [...prevState.gameLog, message]
    }))
  }


  function handlePlayCard(card, player) {
    const currentPlayer = player === 1 ? gameState.playerOne : gameState.playerTwo
    
    //only play if the player has not played a card yet and the bet stack is empty
    if (currentPlayer.playStack.length === 0 && gameState.betStack.value === 0) {
      updatePlayer(player, {
        playStack: [card],
        hand: currentPlayer.hand.filter(c => c.id !== card.id)
      })
      addToGameLog(`${card.name} played by Player ${player}`)
    } else if (gameState.betStack.value > 0) {
      addToGameLog(`${card.name} cannot be played (Player ${player} has not bet/accepted)`)
    } else {
      addToGameLog(`${card.name} cannot be played (Player ${player} already played this trick)`)
    }
  }
  
  function handleFold(player) {
    addToGameLog(`Player ${player} folds`)
    addToGameLog(`--------------------------------`)
    
    const winner = player === 1 ? 2 : 1
    updatePlayer(winner, { trickScore: 2 })
    updateGameState({
      betStack: { value: 0, player: null },
      isStarted: false
    })
  }

  function handleAccept(player) {
    if (gameState.betStack.value > 0) {
      if (gameState.betStack.player !== player) {
        addToGameLog(`Player ${player} accepts`)
        updateGameState({
          bet: { value: gameState.betStack.value, player: player },
          betStack: { value: 0, player: null }
        })
      } else {
        addToGameLog(`Player ${player} cannot accept (bet setter)`)
      }
    } else {
      addToGameLog(`Player ${player} cannot accept (no bet has been made)`)
    }
  }

  function handleBet(betValue, player) {
    addToGameLog(`Player ${player} bets ${betValue}`)
    
    if (betValue > 3) {
      updateGameState({
        bet: { value: betValue - 3, player: player }
      })
    }
    
    updateGameState({
      betStack: { value: betValue, player: player }
    })
  }

  function handleResetGame() {
    updateGameState({
      divaCard: null,
      manilhas: [],
      gameLog: [],
      betStack: { value: 0, player: null },
      bet: { value: 1, player: null },
      trick: 1,
      deck: JSON.parse(JSON.stringify(startingDeck)),
      isStarted: false
    })
    
    updatePlayer(1, {
      hand: [],
      playStack: [],
      trickScore: 0,
      roundScore: 0
    })
    
    updatePlayer(2, {
      hand: [],
      playStack: [],
      trickScore: 0,
      roundScore: 0
    })
  }

  function handleNewRound() {
    // Reset deck
    const newDeck = JSON.parse(JSON.stringify(startingDeck))
    newDeck.forEach(card => card.drawn = false)
    
    // Generate new hands and diva card
    const playerOneHand = drawCards(newDeck, 3, 1)
    const playerTwoHand = drawCards(newDeck, 3, 2)
    const divaCard = drawCards(newDeck, 1)[0]
    
    // Calculate manilhas
    const divaSuit = Math.ceil(divaCard.id / 4)
    const manilhas = newDeck.filter(card => Math.ceil(card.id / 4) - 1 === (divaSuit % 10))
    manilhas.forEach(card => { card.id += 100 })
    
    // Update all state at once
    updateGameState({
      deck: newDeck,
      gameLog: [],
      divaCard,
      manilhas,
      isStarted: true,
      betStack: { value: 0, player: null },
      bet: { value: 1, player: null },
      trick: 1
    })
    
    // Update players
    updatePlayer(1, {
      hand: playerOneHand,
      playStack: [],
      trickScore: 0,
    })
    
    updatePlayer(2, {
      hand: playerTwoHand,
      playStack: [],
      trickScore: 0,
    })

    addToGameLog(`Dealt Player 1's hand`)
    addToGameLog(`Dealt Player 2's hand`)
    addToGameLog(`--------------------------------`)
  }

  //socket listeners
  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }
    function onDisconnect() {
      setIsConnected(false)
    }
    function onError(error) {
      console.error("Socket error:", error)
    }
    function onPlayCard(card, player) {
      handlePlayCard(card, player)
    }
    function onFold(player) {
      handleFold(player)
    }
    function onAccept(player) {
      handleAccept(player)
    }
    function onBet(betValue, player) {
      handleBet(betValue, player)
    }
    function onNewRound() {
      handleNewRound()
    }
    function onResetGame() {
      handleResetGame()
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("error", onError)
    socket.on("play card", onPlayCard)
    socket.on("fold", onFold)
    socket.on("accept", onAccept)
    socket.on("bet", onBet)
    socket.on("new round", onNewRound)
    socket.on("reset game", onResetGame)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("error", onError)
      socket.off("play card", onPlayCard)
      socket.off("fold", onFold)
      socket.off("accept", onAccept)
      socket.off("bet", onBet)
      socket.off("new round", onNewRound)
      socket.off("reset game", onResetGame)
    }
  }, [])

  const emitSocketEvent = (event, data) => {
    switch (event) {
      case "play card":
        socket.emit("play card", data.card, data.player)
        break;
      case "fold":
        socket.emit("fold", data.player)
        break;
      case "accept":
        socket.emit("accept", data.player)
        break;
      case "bet":
        socket.emit("bet", data.betValue, data.player)
        break;
      case "new round":
        socket.emit("new round")
        break;
      case "reset game":  
        socket.emit("reset game")
        break;
      default:
        console.log(`Unknown event: ${event}`)
    }
  }
  
  // Check for trick completion
  useEffect(() => {
    if (gameState.playerOne.playStack.length > 0 && gameState.playerTwo.playStack.length > 0) {
      updateGameState({ trick: gameState.trick + 1 })
      
      const playerOneWinsTrick = gameState.playerOne.playStack[0].id > gameState.playerTwo.playStack[0].id
      const playerTwoWinsTrick = gameState.playerOne.playStack[0].id < gameState.playerTwo.playStack[0].id
       
      if (playerOneWinsTrick) {
        addToGameLog(`Player 1 wins trick ${gameState.trick}`)
        updatePlayer(1, { trickScore: gameState.playerOne.trickScore + 1 })
      } else if (playerTwoWinsTrick) {
        addToGameLog(`Player 2 wins trick ${gameState.trick}`)
        updatePlayer(2, { trickScore: gameState.playerTwo.trickScore + 1 })
      }

      addToGameLog(`--------------------------------`)

      // Reset play stacks
      updatePlayer(1, { playStack: [] })
      updatePlayer(2, { playStack: [] })
    }
  }, [gameState.playerOne.playStack.length, gameState.playerTwo.playStack.length])

  // React to trick completion
  useEffect(() => {
    if (gameState.playerOne.trickScore === 2) {
      addToGameLog(`Player 1 wins the round!`)
      updateGameState({
        isStarted: false,
        trick: 1
      })
      updatePlayer(1, { 
        roundScore: gameState.playerOne.roundScore + gameState.bet.value,
        trickScore: 0
      })
      updatePlayer(2, { trickScore: 0 })
    } else if (gameState.playerTwo.trickScore === 2) {
      addToGameLog(`Player 2 wins the round!`)
      updateGameState({
        isStarted: false,
        trick: 1
      })
      updatePlayer(2, { 
        roundScore: gameState.playerTwo.roundScore + gameState.bet.value,
        trickScore: 0
      })
      updatePlayer(1, { trickScore: 0 })
    }
  }, [gameState.playerOne.trickScore, gameState.playerTwo.trickScore, gameState.bet])

  // React to round completion
  useEffect(() => {
    if (gameState.playerOne.roundScore > 0 || gameState.playerTwo.roundScore > 0) {
      addToGameLog(`Player 1's score: ${gameState.playerOne.roundScore}`)
      addToGameLog(`Player 2's score: ${gameState.playerTwo.roundScore}`)
      addToGameLog(`--------------------------------`)
      
      if (gameState.playerOne.roundScore >= 12) {
        addToGameLog(`Player 1 wins the game!`)
        updateGameState({ isStarted: false })
        updatePlayer(1, { roundScore: 0 })
        updatePlayer(2, { roundScore: 0 })
      } else if (gameState.playerTwo.roundScore >= 12) {
        addToGameLog(`Player 2 wins the game!`)
        updateGameState({ isStarted: false })
        updatePlayer(1, { roundScore: 0 })
        updatePlayer(2, { roundScore: 0 })
      }
    }
  }, [gameState.playerOne.roundScore, gameState.playerTwo.roundScore])

  // Render the game UI
  const playerOneHandItems = gameState.isStarted ? gameState.playerOne.hand.map((card) => (
    <button onClick={() => emitSocketEvent("play card", { card, player: 1 })} key={card.id}>
      {card.name}
    </button>)
  ) : <button>N/A</button>

  const playerTwoHandItems = gameState.isStarted ? gameState.playerTwo.hand.map((card) => (
    <button onClick={() => emitSocketEvent("play card", { card, player: 2 })} key={card.id}>
      {card.name}
    </button>
  )) : <button>N/A</button>

  const playerOneActions = gameState.isStarted ? (
    <div>
      {(gameState.betStack.value === 0 && gameState.bet.value === 1) && <button onClick={() => emitSocketEvent("bet", { betValue: 3, player: 1 })}>Truco</button>}
      {((gameState.betStack.value === 3 || (gameState.bet.value === 3 && gameState.betStack.value === 0)) && gameState.betStack.player !== 1) && <button onClick={() => emitSocketEvent("bet", { betValue: 6, player: 1 })}>Seis</button>}
      {((gameState.betStack.value === 6 || (gameState.bet.value === 6 && gameState.betStack.value === 0)) && gameState.betStack.player !== 1) && <button onClick={() => emitSocketEvent("bet", { betValue: 9, player: 1 })}>Nove</button>}
      {((gameState.betStack.value === 9 || (gameState.bet.value === 9 && gameState.betStack.value === 0)) && gameState.betStack.player !== 1) && <button onClick={() => emitSocketEvent("bet", { betValue: 12, player: 1 })}>Doze</button>} 
      <button onClick={() => emitSocketEvent("fold", { player: 1 })}>Corro</button>
      <button onClick={() => emitSocketEvent("accept", { player: 1 })}>Aceito</button>
    </div>
  ) : <button>N/A</button>

  const playerTwoActions = gameState.isStarted ? (
    <div>
      {(gameState.betStack.value === 0 && gameState.bet.value === 1) && <button onClick={() => emitSocketEvent("bet", { betValue: 3, player: 2 })}>Truco</button>}
      {((gameState.betStack.value === 3 || (gameState.bet.value === 3 && gameState.betStack.value === 0)) && gameState.betStack.player !== 2) && <button onClick={() => emitSocketEvent("bet", { betValue: 6, player: 2 })}>Seis</button>}
      {((gameState.betStack.value === 6 || (gameState.bet.value === 6 && gameState.betStack.value === 0)) && gameState.betStack.player !== 2) && <button onClick={() => emitSocketEvent("bet", { betValue: 9, player: 2 })}>Nove</button>}
      {((gameState.betStack.value === 9 || (gameState.bet.value === 9 && gameState.betStack.value === 0)) && gameState.betStack.player !== 2) && <button onClick={() => emitSocketEvent("bet", { betValue: 12, player: 2 })}>Doze</button>}
      <button onClick={() => emitSocketEvent("fold", { player: 2 })}>Corro</button>
      <button onClick={() => emitSocketEvent("accept", { player: 2 })}>Aceito</button>
    </div>
  ) : <button>N/A</button>

  return (
    <div>
      <h4>--------------------------------</h4>
      <h1>Truco Paulista</h1>
      <NewRoundButton onNewRound={() => emitSocketEvent("new round")} />
      <ResetGameButton onResetGame={() => emitSocketEvent("reset game")} />
      <h4>--------------------------------</h4>
      <div>
        Diva: {gameState.divaCard?.name || 'Not set'}
        <br />
        Manilhas: {gameState.manilhas.map(card => card.name).join(', ') || 'Not set'}
        <br />
        Bet Stack: {gameState.betStack.value}
        <br />
        Bet: {gameState.bet.value}
        <br />
        Player 1's Score: {gameState.playerOne.roundScore}
        <br />
        Player 2's Score: {gameState.playerTwo.roundScore}
      </div>
      <h4>--------------------------------</h4>

      <h4>Player 1's Hand</h4>
      {playerOneHandItems}
      <h4>Player 1 Actions</h4>
      {playerOneActions}
      <h4>Player 2's Hand</h4>
      {playerTwoHandItems}
      <h4>Player 2 Actions</h4>
      {playerTwoActions}
      <h4>--------------------------------</h4>
      <h3>Game Log</h3>
      {gameState.gameLog.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
    </div>
  )
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function drawCards(deck, numCards, player = null) {
  const availableCards = deck.filter(card => !card.drawn)
  const hand = []
  
  for (let i = 0; i < Math.min(numCards, availableCards.length); i++) {
    const randomIndex = getRandomIntInclusive(0, availableCards.length - 1)
    const card = availableCards[randomIndex]
    card.drawn = true
    if (player !== null) {
      card.player = player
    }
    hand.push(card)
    availableCards.splice(randomIndex, 1)
  }
  return hand
}

function NewRoundButton({ onNewRound }) {
  return (
    <div>
      <button onClick={onNewRound}>New Round</button>
    </div>
  )
}

function ResetGameButton({ onResetGame }) {
  return (
    <div>
      <button onClick={onResetGame}>Reset Game</button>
    </div>
  )
}

const suits = ['Diamonds', 'Spades', 'Hearts', 'Clubs']
const values = ['4', '5', '6', '7', 'Queen', 'Jack', 'King', 'Ace', '2', '3']

const startingDeck = values.flatMap(value => suits.map(suit => ({
  id: 4 * values.indexOf(value) + suits.indexOf(suit) + 1,
  name: `${value} of ${suit}`,
  drawn: false,
  player: null
})))