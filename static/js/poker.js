// Poker Game Logic

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

let deck = [];
let playerHand = [];
let dealerHand = [];
let communityCards = [];
let playerChips = 1000;
let currentBet = 0;
let gamePhase = 'idle'; // idle, betting, showdown, result
let dealerBet = 0;

const elements = {
  playerCards: document.getElementById('playerCards'),
  dealerCards: document.getElementById('dealerCards'),
  communityCards: document.getElementById('communityCards'),
  playerChips: document.getElementById('playerChips'),
  playerBet: document.getElementById('playerBet'),
  gameMessage: document.getElementById('gameMessage'),
  playerHand: document.getElementById('playerHand'),
  dealerHand: document.getElementById('dealerHand'),
  gameResult: document.getElementById('gameResult'),
  betAmount: document.getElementById('betAmount'),
  dealBtn: document.getElementById('dealBtn'),
  foldBtn: document.getElementById('foldBtn'),
  callBtn: document.getElementById('callBtn'),
  raiseBtn: document.getElementById('raiseBtn'),
  allInBtn: document.getElementById('allInBtn'),
};

// Create deck
function createDeck() {
  deck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  shuffleDeck();
}

// Shuffle deck
function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Draw card
function drawCard() {
  return deck.pop();
}

// Render cards
function renderCard(card) {
  return `<div class="card"><span class="rank">${card.rank}</span><span class="suit">${card.suit}</span></div>`;
}

function updateDisplay() {
  elements.playerCards.innerHTML = playerHand.map(renderCard).join('');
  elements.dealerCards.innerHTML = dealerHand.slice(0, 1).map(renderCard).join('') + '<div class="card card-back"></div>';
  elements.communityCards.innerHTML = communityCards.map(renderCard).join('');
  elements.playerChips.textContent = playerChips;
  elements.playerBet.textContent = currentBet;
}

// Evaluate hand strength (simplified)
function evaluateHand(cards) {
  if (cards.length < 5) return { name: 'High Card', rank: 0, value: getHighCard(cards) };

  const sortedCards = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);

  // Check flush
  const suits = sortedCards.map(c => c.suit);
  if (new Set(suits).size === 1) return { name: 'Flush', rank: 5, value: getHighCard(sortedCards) };

  // Check straight
  const values = sortedCards.map(c => RANK_VALUES[c.rank]);
  const unique = [...new Set(values)].sort((a, b) => b - a);
  if (unique.length >= 5) {
    for (let i = 0; i <= unique.length - 5; i++) {
      if (unique[i] - unique[i + 4] === 4) {
        return { name: 'Straight', rank: 4, value: unique[i] };
      }
    }
  }

  // Check three of a kind
  const rankCounts = {};
  sortedCards.forEach(c => rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  if (counts[0] === 3) return { name: 'Three of a Kind', rank: 3, value: getHighCard(sortedCards) };
  if (counts[0] === 2 && counts[1] === 2) return { name: 'Two Pair', rank: 2, value: getHighCard(sortedCards) };
  if (counts[0] === 2) return { name: 'One Pair', rank: 1, value: getHighCard(sortedCards) };

  return { name: 'High Card', rank: 0, value: getHighCard(sortedCards) };
}

function getHighCard(cards) {
  return Math.max(...cards.map(c => RANK_VALUES[c.rank]));
}

// Deal hand
function dealHand() {
  if (playerChips < 10) {
    elements.gameMessage.textContent = 'Not enough chips! Game Over.';
    return;
  }

  createDeck();
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  communityCards = [];

  const betAmount = parseInt(elements.betAmount.value) || 50;
  if (betAmount > playerChips) {
    elements.gameMessage.textContent = 'Bet exceeds your chips!';
    return;
  }

  currentBet = betAmount;
  playerChips -= betAmount;
  dealerBet = betAmount;
  gamePhase = 'betting';

  updateDisplay();
  elements.gameMessage.textContent = 'Place your bet. Click Flop to continue.';
  elements.dealBtn.textContent = 'Flop';
  elements.dealBtn.onclick = showFlop;
  disableButtons(false);
}

function showFlop() {
  communityCards = [drawCard(), drawCard(), drawCard()];
  updateDisplay();
  elements.gameMessage.textContent = 'Flop revealed. Fold, Call, or Raise?';
  elements.dealBtn.textContent = 'Turn';
  elements.dealBtn.onclick = showTurn;
}

function showTurn() {
  communityCards.push(drawCard());
  updateDisplay();
  elements.gameMessage.textContent = 'Turn revealed. Make your move.';
  elements.dealBtn.textContent = 'River';
  elements.dealBtn.onclick = showRiver;
}

function showRiver() {
  communityCards.push(drawCard());
  updateDisplay();
  elements.gameMessage.textContent = 'River revealed. Last chance to bet!';
  elements.dealBtn.textContent = 'Showdown';
  elements.dealBtn.onclick = showdown;
}

function showdown() {
  const playerAllCards = [...playerHand, ...communityCards];
  const dealerAllCards = [...dealerHand, ...communityCards];

  const playerEval = evaluateHand(playerAllCards);
  const dealerEval = evaluateHand(dealerAllCards);

  elements.playerHand.textContent = playerEval.name;
  elements.dealerHand.textContent = dealerEval.name;

  let result = '';
  let winnings = 0;

  if (dealerEval.rank < 1) {
    // Dealer didn't qualify
    result = '✅ Dealer didn\'t qualify! You win!';
    winnings = currentBet * 2;
  } else if (playerEval.rank > dealerEval.rank || (playerEval.rank === dealerEval.rank && playerEval.value > dealerEval.value)) {
    result = '✅ You win!';
    winnings = currentBet * 2;
  } else if (playerEval.rank === dealerEval.rank && playerEval.value === dealerEval.value) {
    result = '🤝 Push! Your bet is returned.';
    winnings = currentBet;
  } else {
    result = '❌ Dealer wins!';
    winnings = 0;
  }

  playerChips += winnings;
  elements.playerChips.textContent = playerChips;

  elements.gameResult.innerHTML = `<h2>${result}</h2><p>Your hand: ${playerEval.name}</p><p>Dealer hand: ${dealerEval.name}</p>`;

  gamePhase = 'result';
  disableButtons(true);
  elements.dealBtn.textContent = 'Deal Again';
  elements.dealBtn.disabled = false;
  elements.dealBtn.onclick = dealHand;
}

function fold() {
  elements.gameMessage.textContent = '❌ You folded. Dealer wins!';
  playerChips += currentBet; // Return your bet
  dealerBet = 0;
  
  gamePhase = 'result';
  disableButtons(true);
  elements.dealBtn.textContent = 'Deal Again';
  elements.dealBtn.disabled = false;
  elements.dealBtn.onclick = dealHand;
}

function call() {
  elements.gameMessage.textContent = '✓ You called. Revealing flop...';
  currentBet += dealerBet;
  showFlop();
}

function raise() {
  const raiseAmount = parseInt(prompt('Raise amount:') || '0');
  if (raiseAmount > playerChips) {
    alert('Not enough chips!');
    return;
  }
  currentBet += raiseAmount;
  playerChips -= raiseAmount;
  dealerBet = raiseAmount;
  elements.gameMessage.textContent = 'You raised! Dealer calls...';
  updateDisplay();
  setTimeout(showFlop, 1000);
}

function allIn() {
  const allInAmount = playerChips;
  currentBet += allInAmount;
  dealerBet = allInAmount;
  playerChips = 0;
  elements.gameMessage.textContent = 'All in! Revealing cards...';
  updateDisplay();
  setTimeout(showFlop, 1000);
}

function disableButtons(disabled) {
  elements.foldBtn.disabled = disabled;
  elements.callBtn.disabled = disabled;
  elements.raiseBtn.disabled = disabled;
  elements.allInBtn.disabled = disabled;
}

// Event listeners
elements.dealBtn.addEventListener('click', dealHand);
elements.foldBtn.addEventListener('click', fold);
elements.callBtn.addEventListener('click', call);
elements.raiseBtn.addEventListener('click', raise);
elements.allInBtn.addEventListener('click', allIn);

// Initial state
disableButtons(true);
elements.gameMessage.textContent = 'Welcome! Click Deal to start playing.';
