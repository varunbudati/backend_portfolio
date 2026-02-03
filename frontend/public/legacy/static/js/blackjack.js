// Blackjack Game Logic

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let dealerHand = [];
let playerChips = 1000;
let currentBet = 0;
let gameState = 'idle'; // idle, betting, playing, result
let canDouble = false;

const elements = {
  playerCards: document.getElementById('playerCards'),
  dealerCards: document.getElementById('dealerCards'),
  playerChips: document.getElementById('playerChips'),
  playerBet: document.getElementById('playerBet'),
  gameMessage: document.getElementById('gameMessage'),
  playerScore: document.getElementById('playerScore'),
  dealerScore: document.getElementById('dealerScore'),
  gameResult: document.getElementById('gameResult'),
  betAmount: document.getElementById('betAmount'),
  dealBtn: document.getElementById('dealBtn'),
  hitBtn: document.getElementById('hitBtn'),
  standBtn: document.getElementById('standBtn'),
  doubleBtn: document.getElementById('doubleBtn'),
};

// Create and shuffle deck
function createDeck() {
  deck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  shuffleDeck();
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Draw card
function drawCard() {
  if (deck.length < 10) {
    createDeck();
  }
  return deck.pop();
}

// Card value calculation
function getCardValue(rank) {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank);
}

// Calculate hand score
function calculateScore(hand) {
  let score = 0;
  let aces = 0;

  for (let card of hand) {
    score += getCardValue(card.rank);
    if (card.rank === 'A') aces++;
  }

  // Adjust for aces
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
}

// Render card
function renderCard(card, faceDown = false) {
  if (faceDown) {
    return `<div class="card card-back"></div>`;
  }
  return `<div class="card"><span class="rank">${card.rank}</span><span class="suit">${card.suit}</span></div>`;
}

// Update display
function updateDisplay(showDealerCard = false) {
  const playerScore = calculateScore(playerHand);
  const dealerVisibleScore = showDealerCard ? calculateScore(dealerHand) : calculateScore([dealerHand[0]]);

  elements.playerCards.innerHTML = playerHand.map(card => renderCard(card)).join('');
  elements.dealerCards.innerHTML = dealerHand.map((card, idx) => renderCard(card, idx === 1 && !showDealerCard)).join('');

  elements.playerScore.textContent = playerScore;
  elements.dealerScore.textContent = showDealerCard ? calculateScore(dealerHand) : '?';
  elements.playerChips.textContent = playerChips;
  elements.playerBet.textContent = currentBet;
}

// Deal initial hand
function dealHand() {
  if (playerChips < 10) {
    elements.gameMessage.textContent = '❌ Not enough chips! Game Over.';
    return;
  }

  const betAmount = parseInt(elements.betAmount.value) || 50;
  if (betAmount > playerChips) {
    elements.gameMessage.textContent = '❌ Bet exceeds your chips!';
    return;
  }

  // Reset game
  createDeck();
  playerHand = [];
  dealerHand = [];
  elements.gameResult.innerHTML = '';

  currentBet = betAmount;
  playerChips -= betAmount;

  // Deal initial cards
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  canDouble = playerChips >= currentBet && playerHand.length === 2;

  updateDisplay(false);
  gameState = 'playing';

  // Check for blackjack
  if (playerScore === 21 && playerHand.length === 2) {
    endGameBlackjack();
    return;
  }

  // Check dealer blackjack
  if (dealerScore === 21 && dealerHand.length === 2) {
    endGameDealerBlackjack();
    return;
  }

  elements.gameMessage.textContent = `Dealer showing: ${dealerHand[0].rank}. Your score: ${playerScore}. Hit or Stand?`;
  enableGameButtons(true);
}

// Player hits
function hit() {
  playerHand.push(drawCard());
  const playerScore = calculateScore(playerHand);

  updateDisplay(false);

  if (playerScore > 21) {
    elements.gameMessage.textContent = `❌ Bust! You went over 21.`;
    endGame('bust');
    return;
  }

  if (playerScore === 21) {
    elements.gameMessage.textContent = `✓ You got 21! Stand to complete.`;
    elements.hitBtn.disabled = true;
    return;
  }

  elements.gameMessage.textContent = `Your score: ${playerScore}. Hit or Stand?`;
  canDouble = false;
  elements.doubleBtn.disabled = true;
}

// Player stands
function stand() {
  dealerPlay();
}

// Double down
function doubleDown() {
  if (!canDouble || playerChips < currentBet) {
    alert('Cannot double down!');
    return;
  }

  playerChips -= currentBet;
  currentBet *= 2;
  playerHand.push(drawCard());

  const playerScore = calculateScore(playerHand);
  updateDisplay(false);

  if (playerScore > 21) {
    elements.gameMessage.textContent = `❌ Bust! You went over 21.`;
    endGame('bust');
    return;
  }

  dealerPlay();
}

// Dealer's turn
function dealerPlay() {
  updateDisplay(true);
  let dealerScore = calculateScore(dealerHand);

  while (dealerScore < 17) {
    dealerHand.push(drawCard());
    dealerScore = calculateScore(dealerHand);
    updateDisplay(true);
  }

  determineWinner();
}

// Determine winner
function determineWinner() {
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  let result = '';
  let winnings = 0;

  if (dealerScore > 21) {
    result = '✅ Dealer bust! You win!';
    winnings = currentBet * 2;
  } else if (playerScore > dealerScore) {
    result = '✅ You win!';
    winnings = currentBet * 2;
  } else if (playerScore === dealerScore) {
    result = '🤝 Push! Tie.';
    winnings = currentBet;
  } else {
    result = '❌ Dealer wins!';
    winnings = 0;
  }

  playerChips += winnings;
  elements.playerChips.textContent = playerChips;

  elements.gameResult.innerHTML = `
    <h2>${result}</h2>
    <p>Your Score: ${playerScore}</p>
    <p>Dealer Score: ${dealerScore}</p>
  `;

  endGame('complete');
}

// Blackjack!
function endGameBlackjack() {
  if (calculateScore(dealerHand) === 21 && dealerHand.length === 2) {
    elements.gameResult.innerHTML = '<h2>🤝 Push! Both have Blackjack.</h2>';
    playerChips += currentBet;
  } else {
    elements.gameResult.innerHTML = '<h2>🎉 Blackjack! You win!</h2>';
    playerChips += Math.floor(currentBet * 2.5);
  }

  elements.playerChips.textContent = playerChips;
  endGame('complete');
}

// Dealer has blackjack
function endGameDealerBlackjack() {
  updateDisplay(true);
  elements.gameResult.innerHTML = '<h2>❌ Dealer Blackjack! You lose.</h2>';
  endGame('complete');
}

// End game
function endGame(result) {
  gameState = 'result';
  enableGameButtons(false);

  if (playerChips > 0) {
    elements.dealBtn.disabled = false;
    elements.gameMessage.textContent = `Chips: ${playerChips}. Click Deal to play again.`;
  } else {
    elements.gameMessage.textContent = '❌ Game Over! No chips left.';
  }
}

// Enable/disable buttons
function enableGameButtons(enabled) {
  elements.hitBtn.disabled = !enabled;
  elements.standBtn.disabled = !enabled;
  elements.doubleBtn.disabled = !enabled || !canDouble;
  elements.dealBtn.disabled = enabled;
}

// Event listeners
elements.dealBtn.addEventListener('click', dealHand);
elements.hitBtn.addEventListener('click', hit);
elements.standBtn.addEventListener('click', stand);
elements.doubleBtn.addEventListener('click', doubleDown);

// Initial state
enableGameButtons(false);
elements.gameMessage.textContent = 'Welcome to Blackjack! Set your bet and click Deal.';
