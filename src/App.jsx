import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [playerOneHand, setPlayerOneHand] = useState([])
  const [playerTwoHand, setPlayerTwoHand] = useState([])
  const [gameLog, setGameLog] = useState([])
  const [playerOnePlayStack, setPlayerOnePlayStack] = useState([])
  const [playerTwoPlayStack, setPlayerTwoPlayStack] = useState([])
  const [trick, setTrick] = useState(1)
  const [playerOneTrickScore, setPlayerOneTrickScore] = useState(0)
  const [playerTwoTrickScore, setPlayerTwoTrickScore] = useState(0)
  const [deck, setDeck] = useState(JSON.parse(JSON.stringify(startingDeck)))

  function addToGameLog(message) {
    setGameLog(prevLog => [...prevLog, message])
  }

  function handleNewGame() {
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
    setTrick(1)

    // Generate new hands and diva card
    const playerOneHand = drawCards(newDeck, 3)
    const playerTwoHand = drawCards(newDeck, 3)
    const divaCard = drawCards(newDeck, 1)[0]
    setPlayerOneHand(playerOneHand)
    setPlayerTwoHand(playerTwoHand)

    // Set player property for each card
    playerOneHand.forEach(card => {
      card.player = 1
    })
    playerTwoHand.forEach(card => {
      card.player = 2
    })    

    // Calculate manilhas based on the diva card
    const manilhas = newDeck.filter(card => {
      return Math.ceil(card.id / 4) - 1 === ((Math.ceil(divaCard.id / 4)) % 10)
    })

    // Add 100 to manilhas ids so they place higher in rankings
    manilhas.forEach(card => {
      card.id += 100
    })
    
    setIsGameStarted(true)

    addToGameLog(`Diva: ${divaCard.name}`)
    addToGameLog(`Manilhas: ${manilhas.map(card => card.name).join(', ')}`)
    addToGameLog(`--------------------------------`)
    addToGameLog(`BEGIN TRICK ${trick}`)
    addToGameLog(`Dealt Player 1's hand`)
    addToGameLog(`Dealt Player 2's hand`)
  }

  function handlePlayCard(card) {
    if (card.player === 1 && playerOnePlayStack.length === 0) {
      setPlayerOnePlayStack([card])
      addToGameLog(`${card.name} played by Player ${card.player}`)
    } else if (card.player === 2 && playerTwoPlayStack.length === 0) {
      setPlayerTwoPlayStack([card])
      addToGameLog(`${card.name} played by Player ${card.player}`)
    } else {
      addToGameLog(`${card.name} cannot be played (Player ${card.player} already played this trick)`)
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
      addToGameLog(`BEGIN TRICK ${trick}`)

      setPlayerOnePlayStack([])
      setPlayerTwoPlayStack([])
    }
  }, [playerOnePlayStack.length, playerTwoPlayStack.length, deck])

  //TODO: add trick completion logic for deciding when to print the next trick and when to increment it

  // React to score changes
  useEffect(() => {
    if (playerOneTrickScore === 2) {
      addToGameLog(`Player 1 wins the round!`)
      setIsGameStarted(false)
      setTrick(1)
      setPlayerOneTrickScore(0)
      setPlayerTwoTrickScore(0)
    } else if (playerTwoTrickScore === 2) {
      addToGameLog(`Player 2 wins the round!`)
      setIsGameStarted(false)
      setTrick(1)
      setPlayerOneTrickScore(0)
      setPlayerTwoTrickScore(0)
    }
  }, [playerOneTrickScore, playerTwoTrickScore])

  const playerOneHandItems = isGameStarted ? playerOneHand.map((card) => (
    <button onClick={() => handlePlayCard(card)} key={card.id}>
      {card.name}
    </button>
  )) : <button>N/A</button>

  const playerTwoHandItems = isGameStarted ? playerTwoHand.map((card) => (
    <button onClick={() => handlePlayCard(card)} key={card.id}>
      {card.name}
    </button>
  )) : <button>N/A</button>

  return (
    <div>
      <h1>Truco Paulista</h1>
      <NewGameButton onNewGame={handleNewGame} />
      <h4>Player 1's Hand</h4>
      {playerOneHandItems}
      <h4>Player 1 Actions</h4>
      <h4>Player 2's Hand</h4>
      {playerTwoHandItems}
      <h4>Player 2 Actions</h4>
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

function drawCards(deck, numCards) {
  const hand = []
  for (let i = 0; i < numCards; i++) {
    const randomIndex = getRandomIntInclusive(0, deck.length - 1)
    if (deck[randomIndex].drawn) {
      i--
    } else {
      const card = deck[randomIndex]
      deck[randomIndex].drawn = true
      hand.push(card)
    }
  }
  return hand
}

function NewGameButton({ onNewGame }) {
  return (
    <div>
      <button onClick={onNewGame}>New Game</button>
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