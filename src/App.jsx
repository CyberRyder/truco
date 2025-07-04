import { useState } from 'react'
import './App.css'

export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [playerOneHand, setPlayerOneHand] = useState([])
  const [playerTwoHand, setPlayerTwoHand] = useState([])
  const [divaCard, setDivaCard] = useState(null)
  const [manilhas, setManilhas] = useState([])

  function handleNewGame() {
    // Reset deck
    const deck = JSON.parse(JSON.stringify(startingDeck))
    deck.forEach(card => card.drawn = false)
    
    // Generate new hands
    setPlayerOneHand(drawCards(deck, 3))
    setPlayerTwoHand(drawCards(deck, 3))
    const newDivaCard = drawCards(deck, 1)[0]
    setDivaCard(newDivaCard)
    
    // Calculate manilhas based on the diva card
    const manilhasCards = deck.filter(card => {
      return Math.ceil(card.id / 4) - 1 === ((Math.ceil(newDivaCard.id / 4)) % 10)
    })
    
    // Add 100 to manilhas ids so they place higher in rankings
    manilhasCards.forEach(card => {
      card.id += 100
    })
    
    setManilhas(manilhasCards)
    setIsGameStarted(true)
  }

  function handlePlayCard(card) {
    console.log(card)
  }

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

  const diva = isGameStarted ? (
    <div key={divaCard.id}>
      {divaCard.name}
    </div>
  ) : <div>N/A</div>

  return (
    <div>
      <h1>Truco Paulista</h1>
      <NewGameButton onNewGame={handleNewGame} />
      <h4>Player One's Hand</h4>
      {playerOneHandItems}
      <h4>Player Two's Hand</h4>
      {playerTwoHandItems}
      <h4>Diva</h4>
      {diva}
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

const startingDeck = [
  { id: 1, name: '4 of Diamonds', drawn: false},
  { id: 2, name: '4 of Spades', drawn: false},
  { id: 3, name: '4 of Hearts', drawn: false},
  { id: 4, name: '4 of Clubs', drawn: false},
  { id: 5, name: '5 of Diamonds', drawn: false},
  { id: 6, name: '5 of Spades', drawn: false},
  { id: 7, name: '5 of Hearts', drawn: false},
  { id: 8, name: '5 of Clubs', drawn: false},
  { id: 9, name: '6 of Diamonds', drawn: false},
  { id: 10, name: '6 of Spades', drawn: false},
  { id: 11, name: '6 of Hearts', drawn: false},
  { id: 12, name: '6 of Clubs', drawn: false},
  { id: 13, name: '7 of Diamonds', drawn: false},
  { id: 14, name: '7 of Spades', drawn: false},
  { id: 15, name: '7 of Hearts', drawn: false},
  { id: 16, name: '7 of Clubs', drawn: false},
  { id: 17, name: 'Queen of Diamonds', drawn: false},
  { id: 18, name: 'Queen of Spades', drawn: false},
  { id: 19, name: 'Queen of Hearts', drawn: false},
  { id: 20, name: 'Queen of Clubs', drawn: false},
  { id: 21, name: 'Jack of Diamonds', drawn: false},
  { id: 22, name: 'Jack of Spades', drawn: false},
  { id: 23, name: 'Jack of Hearts', drawn: false},
  { id: 24, name: 'Jack of Clubs', drawn: false},
  { id: 25, name: 'King of Diamonds', drawn: false},
  { id: 26, name: 'King of Spades', drawn: false},
  { id: 27, name: 'King of Hearts', drawn: false},
  { id: 28, name: 'King of Clubs', drawn: false},
  { id: 29, name: 'Ace of Diamonds', drawn: false},
  { id: 30, name: 'Ace of Spades', drawn: false},
  { id: 31, name: 'Ace of Hearts', drawn: false},
  { id: 32, name: 'Ace of Clubs', drawn: false},
  { id: 33, name: '2 of Diamonds', drawn: false},
  { id: 34, name: '2 of Spades', drawn: false},
  { id: 35, name: '2 of Hearts', drawn: false},
  { id: 36, name: '2 of Clubs', drawn: false},
  { id: 37, name: '3 of Diamonds', drawn: false},
  { id: 38, name: '3 of Spades', drawn: false},
  { id: 39, name: '3 of Hearts', drawn: false},
  { id: 40, name: '3 of Clubs', drawn: false},
]