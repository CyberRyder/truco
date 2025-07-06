import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [playerOneHand, setPlayerOneHand] = useState([])
  const [playerTwoHand, setPlayerTwoHand] = useState([])
  const [divaCard, setDivaCard] = useState(null)
  const [manilhas, setManilhas] = useState([])
  const [gameLog, setGameLog] = useState([])
  const [playerOnePlayStack, setPlayerOnePlayStack] = useState([])
  const [playerTwoPlayStack, setPlayerTwoPlayStack] = useState([])
  const [trick, setTrick] = useState(1)
  const [playerOneTrickScore, setPlayerOneTrickScore] = useState(0)
  const [playerTwoTrickScore, setPlayerTwoTrickScore] = useState(0)
  const [deck, setDeck] = useState(JSON.parse(JSON.stringify(startingDeck)))
  const [bet, setBet] = useState({ value: 1, player: null })
  const [betStack, setBetStack] = useState({ value: 0, player: null })
  const [playerOneRoundScore, setPlayerOneRoundScore] = useState(0)
  const [playerTwoRoundScore, setPlayerTwoRoundScore] = useState(0)

  function addToGameLog(message) {
    setGameLog(prevLog => [...prevLog, message])
  }

  function handleNewRound() {
    // Reset deck
    const newDeck = JSON.parse(JSON.stringify(startingDeck))
    newDeck.forEach(card => card.drawn = false)
    setDeck(newDeck)

    // Reset game log and play stacks
    setGameLog([])
    setPlayerOnePlayStack([])
    setPlayerTwoPlayStack([])
    setPlayerOneTrickScore(0)
    setPlayerTwoTrickScore(0)
    setDivaCard(null)
    setManilhas([])
    setBetStack({ value: 0, player: null })
    setBet({ value: 1, player: null })
    setTrick(1)

    // Generate new hands and diva card with player assignment
    const playerOneHand = drawCards(newDeck, 3, 1)
    const playerTwoHand = drawCards(newDeck, 3, 2)
    const divaCard = drawCards(newDeck, 1)[0]
    setDivaCard(divaCard)
    setPlayerOneHand(playerOneHand)
    setPlayerTwoHand(playerTwoHand)

    // Calculate manilhas based on the diva card
    const divaSuit = Math.ceil(divaCard.id / 4)
    const manilhas = newDeck.filter(card => Math.ceil(card.id / 4) - 1 === (divaSuit % 10))
    setManilhas(manilhas)

    // Add 100 to manilhas ids so they place higher in rankings
    manilhas.forEach(card => {
      card.id += 100
    })
    
    setIsGameStarted(true)

    addToGameLog(`Dealt Player 1's hand`)
    addToGameLog(`Dealt Player 2's hand`)
    addToGameLog(`--------------------------------`)
  }

  function handlePlayCard(card, player) {
    if (player === 1 && playerOnePlayStack.length === 0 && betStack.value === 0) {
      setPlayerOnePlayStack([card])
      setPlayerOneHand(prevHand => prevHand.filter(c => c.id !== card.id))
      addToGameLog(`${card.name} played by Player ${player}`)
    } else if (player === 2 && playerTwoPlayStack.length === 0 && betStack.value === 0) {
      setPlayerTwoPlayStack([card])
      setPlayerTwoHand(prevHand => prevHand.filter(c => c.id !== card.id))
      addToGameLog(`${card.name} played by Player ${player}`)
    } else if (betStack.value > 0) {
      addToGameLog(`${card.name} cannot be played (Player ${player} has not bet/accepted)`)
    } else if (playerOnePlayStack.length > 0 || playerTwoPlayStack.length > 0) {
      addToGameLog(`${card.name} cannot be played (Player ${player} already played this trick)`)
    }
  }

  // Check for trick completion using useEffect
  useEffect(() => {
    if (playerOnePlayStack.length > 0 && playerTwoPlayStack.length > 0) {
      setTrick(prevTrick => prevTrick + 1)
      const playerOneWinsTrick = playerOnePlayStack[0].id > playerTwoPlayStack[0].id
      const playerTwoWinsTrick = playerOnePlayStack[0].id < playerTwoPlayStack[0].id
       
      if (playerOneWinsTrick) {
        addToGameLog(`Player 1 wins trick ${trick}`)
        setPlayerOneTrickScore(prevTrickScore => prevTrickScore + 1)
      } else if (playerTwoWinsTrick) {
        addToGameLog(`Player 2 wins trick ${trick}`)
        setPlayerTwoTrickScore(prevTrickScore => prevTrickScore + 1)
      }

      addToGameLog(`--------------------------------`)

      setPlayerOnePlayStack([])
      setPlayerTwoPlayStack([])
    }
  }, [playerOnePlayStack.length, playerTwoPlayStack.length, deck])


  // React to score changes
  useEffect(() => {
    if (playerOneTrickScore === 2) {
      addToGameLog(`Player 1 wins the round!`)
      setIsGameStarted(false)
      setTrick(1)
      setPlayerOneTrickScore(0)
      setPlayerTwoTrickScore(0)
      setPlayerOneRoundScore(prevRoundScore => prevRoundScore + bet.value)
    } else if (playerTwoTrickScore === 2) {
      addToGameLog(`Player 2 wins the round!`)
      setIsGameStarted(false)
      setTrick(1)
      setPlayerOneTrickScore(0)
      setPlayerTwoTrickScore(0)
      setPlayerTwoRoundScore(prevRoundScore => prevRoundScore + bet.value)
    }
  }, [playerOneTrickScore, playerTwoTrickScore, bet])

  // Separate useEffect for logging round scores
  useEffect(() => {
    if (playerOneRoundScore > 0 || playerTwoRoundScore > 0) {
      addToGameLog(`Player 1's score: ${playerOneRoundScore}`)
      addToGameLog(`Player 2's score: ${playerTwoRoundScore}`)
      addToGameLog(`--------------------------------`)
      if (playerOneRoundScore >= 12) {
        addToGameLog(`Player 1 wins the game!`)
        setIsGameStarted(false)
        setPlayerOneRoundScore(0)
        setPlayerTwoRoundScore(0)
      } else if (playerTwoRoundScore >= 12) {
        addToGameLog(`Player 2 wins the game!`)
        setIsGameStarted(false)
        setPlayerOneRoundScore(0)
        setPlayerTwoRoundScore(0)
      }
    }
  }, [playerOneRoundScore, playerTwoRoundScore])

  function handleResetGame() {
    setPlayerOneHand([])
    setPlayerTwoHand([])
    setDivaCard(null)
    setManilhas([])
    setGameLog([])
    setPlayerOnePlayStack([])
    setPlayerTwoPlayStack([])
    setPlayerOneTrickScore(0)
    setPlayerTwoTrickScore(0)
    setBet({ value: 1, player: null })
    setBetStack({ value: 0, player: null })
    setTrick(1)
    setPlayerOneRoundScore(0)
    setPlayerTwoRoundScore(0)
    setDeck(JSON.parse(JSON.stringify(startingDeck)))
    setIsGameStarted(false)
  }

  const playerOneHandItems = isGameStarted ? playerOneHand.map((card) => (
    <button onClick={() => handlePlayCard(card, 1)} key={card.id}>
      {card.name}
    </button>)
  ) : <button>N/A</button>

  const playerTwoHandItems = isGameStarted ? playerTwoHand.map((card) => (
    <button onClick={() => handlePlayCard(card, 2)} key={card.id}>
      {card.name}
    </button>
  )) : <button>N/A</button>
  
  function handleFold(player) {
    addToGameLog(`Player ${player} folds`)
    addToGameLog(`--------------------------------`)
    if (player === 1) {
      setPlayerTwoTrickScore(2)
      setBetStack({ value: 0, player: null })
    } else if (player === 2) {
      setPlayerOneTrickScore(2)
      setBetStack({ value: 0, player: null })
    } else {
      addToGameLog(`Invalid player`)
    }
    setIsGameStarted(false)
  }

  function handleAccept(player) {
    if (betStack.value > 0) {
      if (betStack.player !== player) {
        addToGameLog(`Player ${player} accepts`)
        setBet({ value: betStack.value, player: player })
        setBetStack({ value: 0, player: null })
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
      setBet({ value: betValue - 3, player: player })
    }
    setBetStack({ value: betValue, player: player })
  }

  //TODO: add logic to include accepting
  const playerOneActions = isGameStarted ? (
    <div>
      {(betStack.value === 0 && bet.value === 1) && <button onClick={() => handleBet(3, 1)}>Truco</button>}
      {((betStack.value === 3 || (bet.value === 3 && betStack.value === 0)) && betStack.player !== 1) && <button onClick={() => handleBet(6, 1)}>Seis</button>}
      {((betStack.value === 6 || (bet.value === 6 && betStack.value === 0)) && betStack.player !== 1) && <button onClick={() => handleBet(9, 1)}>Nove</button>}
      {((betStack.value === 9 || (bet.value === 9 && betStack.value === 0)) && betStack.player !== 1) && <button onClick={() => handleBet(12, 1)}>Doze</button>} 
      <button onClick={() => handleFold(1)}>Corro</button>
      <button onClick={() => handleAccept(1)}>Aceito</button>
    </div>
  ) : <button>N/A</button>

  const playerTwoActions = isGameStarted ? (
    <div>
      {(betStack.value === 0 && bet.value === 1) && <button onClick={() => handleBet(3, 2)}>Truco</button>}
      {((betStack.value === 3 || (bet.value === 3 && betStack.value === 0)) && betStack.player !== 2) && <button onClick={() => handleBet(6, 2)}>Seis</button>}
      {((betStack.value === 6 || (bet.value === 6 && betStack.value === 0)) && betStack.player !== 2) && <button onClick={() => handleBet(9, 2)}>Nove</button>}
      {((betStack.value === 9 || (bet.value === 9 && betStack.value === 0)) && betStack.player !== 2) && <button onClick={() => handleBet(12, 2)}>Doze</button>}
      <button onClick={() => handleFold(2)}>Corro</button>
      <button onClick={() => handleAccept(2)}>Aceito</button>
    </div>
  ) : <button>N/A</button>

  return (
    <div>
      <h1>Truco Paulista</h1>
      <NewRoundButton onNewRound={handleNewRound} />
      <ResetGameButton onResetGame={handleResetGame} />
      <h4>--------------------------------</h4>
      <div>
        Diva: {divaCard?.name || 'Not set'}
        <br />
        Manilhas: {manilhas.map(card => card.name).join(', ') || 'Not set'}
        <br />
        Bet Stack: {betStack.value}
        <br />
        Bet: {bet.value}
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
      {gameLog.map((message, index) => (
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