'use strict';

// Ticker functionality for displaying market data
const tickerContainer = document.getElementById('ticker-container');

// Sample market data to use if API fails (as fallback)
const initialMarketData = [
  { symbol: 'BTC-USD', name: 'Bitcoin', price: 109428.24, change: '-0.26%', isPositive: false },
  { symbol: 'ETH-USD', name: 'Ethereum', price: 4016.23, change: '-0.49%', isPositive: false },
  { symbol: 'AAPL', name: 'Apple', price: 255.46, change: '-0.55%', isPositive: false },
  { symbol: 'MSFT', name: 'Microsoft', price: 511.46, change: '+0.87%', isPositive: true },
  { symbol: 'GOOGL', name: 'Google', price: 246.54, change: '+0.31%', isPositive: true },
  { symbol: 'AMZN', name: 'Amazon', price: 219.78, change: '+0.75%', isPositive: true },
  { symbol: 'TSLA', name: 'Tesla', price: 440.4, change: '+4.02%', isPositive: true },
  { symbol: 'NVDA', name: 'NVIDIA', price: 178.19, change: '+0.28%', isPositive: true },
  { symbol: 'JPM', name: 'JPMorgan', price: 316.06, change: '+0.83%', isPositive: true },
  { symbol: 'V', name: 'Visa', price: 337.37, change: '+0.73%', isPositive: true }
];

const marketCard = document.querySelector('.financial-data');
const marketLastUpdatedEl = document.getElementById('market-last-updated');
const marketRefreshBtn = document.getElementById('market-refresh-btn');

const INDEX_ELEMENT_MAP = {
  '^GSPC': {
    value: document.getElementById('sp500-value'),
    change: document.getElementById('sp500-change'),
  },
  '^IXIC': {
    value: document.getElementById('nasdaq-value'),
    change: document.getElementById('nasdaq-change'),
  },
  '^VIX': {
    value: document.getElementById('vix-value'),
    change: document.getElementById('vix-change'),
  },
  '^TNX': {
    value: document.getElementById('treasury-value'),
    change: document.getElementById('treasury-change'),
  },
};

const INDEX_ROW_MAP = {
  '^GSPC': document.querySelector('.data-row[data-symbol="^GSPC"]'),
  '^IXIC': document.querySelector('.data-row[data-symbol="^IXIC"]'),
  '^VIX': document.querySelector('.data-row[data-symbol="^VIX"]'),
  '^TNX': document.querySelector('.data-row[data-symbol="^TNX"]'),
};

const rouletteWheel = document.getElementById('roulette-wheel');
const rouletteResultDisplay = document.getElementById('roulette-result');
const spinButton = document.getElementById('spin-button');

const ROULETTE_NUMBERS = [
  { value: 0, color: 'green' },
  { value: 32, color: 'red' },
  { value: 15, color: 'black' },
  { value: 19, color: 'red' },
  { value: 4, color: 'black' },
  { value: 21, color: 'red' },
  { value: 2, color: 'black' },
  { value: 25, color: 'red' },
  { value: 17, color: 'black' },
  { value: 34, color: 'red' },
  { value: 6, color: 'black' },
  { value: 27, color: 'red' },
  { value: 13, color: 'black' },
  { value: 36, color: 'red' },
  { value: 11, color: 'black' },
  { value: 30, color: 'red' },
  { value: 8, color: 'black' },
  { value: 23, color: 'red' },
  { value: 10, color: 'black' },
  { value: 5, color: 'red' },
  { value: 24, color: 'black' },
  { value: 16, color: 'red' },
  { value: 33, color: 'black' },
  { value: 1, color: 'red' },
  { value: 20, color: 'black' },
  { value: 14, color: 'red' },
  { value: 31, color: 'black' },
  { value: 9, color: 'red' },
  { value: 22, color: 'black' },
  { value: 18, color: 'red' },
  { value: 29, color: 'black' },
  { value: 7, color: 'red' },
  { value: 28, color: 'black' },
  { value: 12, color: 'red' },
  { value: 35, color: 'black' },
  { value: 3, color: 'red' },
  { value: 26, color: 'black' }
];

const POINTER_OFFSET = 90;
let rouletteInitialized = false;
let rouletteIsSpinning = false;
let currentRotation = 0;

function initializeRoulette() {
  if (!rouletteWheel || rouletteInitialized) {
    return;
  }

  const segmentAngle = 360 / ROULETTE_NUMBERS.length;
  const gradientStops = [];

  ROULETTE_NUMBERS.forEach((entry, index) => {
    const start = index * segmentAngle;
    const end = (index + 1) * segmentAngle;
    const colorHex = entry.color === 'red' ? '#be123c' : entry.color === 'black' ? '#111827' : '#0f9d58';
    gradientStops.push(`${colorHex} ${start}deg ${end}deg`);

    const label = document.createElement('span');
    label.className = `roulette-label ${entry.color}`;
    label.textContent = entry.value;

    const rotation = start + segmentAngle / 2;
    label.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) translate(0, -44%) rotate(-${rotation}deg)`;
    rouletteWheel.appendChild(label);
  });

  rouletteWheel.style.background = `conic-gradient(${gradientStops.join(', ')})`;
  currentRotation = ((POINTER_OFFSET - (segmentAngle / 2)) % 360 + 360) % 360;
  rouletteWheel.style.transform = `rotate(${currentRotation}deg)`;
  rouletteInitialized = true;
}

function spinRoulette() {
  if (!rouletteWheel || rouletteIsSpinning) {
    return;
  }

  rouletteIsSpinning = true;

  if (spinButton) {
    spinButton.disabled = true;
  }

  if (rouletteResultDisplay) {
    rouletteResultDisplay.textContent = 'Spinning…';
    rouletteResultDisplay.classList.remove('win-red', 'win-black', 'win-green');
  }

  const segmentAngle = 360 / ROULETTE_NUMBERS.length;
  const targetIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
  const target = ROULETTE_NUMBERS[targetIndex];
  const targetAngle = targetIndex * segmentAngle + segmentAngle / 2;
  const targetNormalized = ((POINTER_OFFSET - targetAngle) % 360 + 360) % 360;

  let diff = targetNormalized - currentRotation;
  if (diff <= 0) {
    diff += 360;
  }

  const spinTurns = Math.floor(Math.random() * 4) + 4;
  const finalRotation = currentRotation + spinTurns * 360 + diff;

  rouletteWheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.8, 0.25, 1)';
  rouletteWheel.style.transform = `rotate(${finalRotation}deg)`;

  const spinDuration = 4000;

  window.setTimeout(() => {
    currentRotation = targetNormalized;
    rouletteWheel.style.transition = 'none';
    rouletteWheel.style.transform = `rotate(${currentRotation}deg)`;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        rouletteWheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.8, 0.25, 1)';
      });
    });

    if (rouletteResultDisplay) {
      rouletteResultDisplay.textContent = `Result: ${target.value} (${target.color.toUpperCase()})`;
      rouletteResultDisplay.classList.add(`win-${target.color}`);
    }

    if (spinButton) {
      spinButton.disabled = false;
    }

    rouletteIsSpinning = false;
  }, spinDuration);
}

if (spinButton) {
  spinButton.addEventListener('click', spinRoulette);
}

// Populate ticker with data
function populateTickerWithData(data) {
  // Clear ticker
  tickerContainer.innerHTML = '';
  
  data.forEach(item => {
    const tickerItem = document.createElement('div');
    tickerItem.className = 'ticker-item';
    
    tickerItem.innerHTML = `
      <span class="ticker-symbol">${item.symbol}</span>
      <span class="ticker-price">$${typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</span>
      <span class="ticker-change ${item.isPositive ? 'positive' : 'negative'}">${item.change}</span>
    `;
    
    tickerContainer.appendChild(tickerItem);
  });
}

// Fetch real market data from backend
async function fetchMarketData() {
  try {
    const response = await fetch('/ticker');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // Update ticker with real-time data
    populateTickerWithData(data);
    
    return true;
  } catch (error) {
    console.error('Error fetching market data:', error);
    // If API fails, use initial data
    populateTickerWithData(initialMarketData);
    
    return false;
  }
}

// Update market indices in the financial dashboard
async function updateMarketIndices(options = {}) {
  const { userInitiated = false } = options;

  if (marketCard) {
    marketCard.classList.add('is-loading');
  }
  if (userInitiated && marketRefreshBtn) {
    marketRefreshBtn.classList.add('spinning');
    marketRefreshBtn.disabled = true;
    marketRefreshBtn.setAttribute('aria-busy', 'true');
  }
  if (userInitiated && marketLastUpdatedEl) {
    marketLastUpdatedEl.textContent = 'Refreshing…';
  }

  try {
    const response = await fetch('/market-indices', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const payload = await response.json();
    let indices = [];
    if (payload && Array.isArray(payload.indices)) {
      indices = payload.indices;
    } else if (Array.isArray(payload)) {
      indices = payload;
    }

    indices.forEach(item => {
      const slots = INDEX_ELEMENT_MAP[item.symbol];
      if (!slots) {
        return;
      }

      if (slots.value) {
        slots.value.textContent = item.value != null ? item.value : 'N/A';
        slots.value.dataset.rawValue = item.rawValue != null ? item.rawValue : '';
        slots.value.dataset.previousClose = item.rawPrevious != null ? item.rawPrevious : '';
      }

      if (slots.change) {
        const changeText = item.change != null ? item.change : '--';
        slots.change.textContent = changeText;
        slots.change.classList.toggle('positive', !!item.isPositive);
        slots.change.classList.toggle('negative', !item.isPositive);
      }

      const row = INDEX_ROW_MAP[item.symbol];
      if (row) {
        row.dataset.trend = item.isPositive ? 'up' : 'down';
        row.dataset.changeType = item.changeType || '';
      }
    });

    if (!indices.length && marketLastUpdatedEl) {
      marketLastUpdatedEl.textContent = 'No market data available';
    }

    if (marketLastUpdatedEl) {
      if (payload && payload.asOf) {
        const updatedDate = new Date(payload.asOf);
        const timeString = updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = updatedDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        marketLastUpdatedEl.textContent = `Last update: ${dateString} ${timeString}`;
        marketLastUpdatedEl.dataset.timestamp = payload.asOf;
      } else {
        marketLastUpdatedEl.textContent = 'Last update: just now';
        delete marketLastUpdatedEl.dataset.timestamp;
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating market indices:', error);
    if (marketLastUpdatedEl) {
      marketLastUpdatedEl.textContent = 'Unable to refresh data';
    }
    return false;
  } finally {
    if (marketCard) {
      marketCard.classList.remove('is-loading');
    }
    if (marketRefreshBtn) {
      marketRefreshBtn.classList.remove('spinning');
      marketRefreshBtn.removeAttribute('aria-busy');
      marketRefreshBtn.disabled = false;
    }
  }
}

// Initialize ticker with initial data
populateTickerWithData(initialMarketData);

// Immediately try to fetch real data
fetchMarketData();

// Refresh ticker data every 60 seconds
setInterval(() => {
  fetchMarketData();
}, 60000);

// Prime market indices immediately and on an interval
updateMarketIndices();
setInterval(() => {
  updateMarketIndices();
}, 60000);

if (marketRefreshBtn) {
  marketRefreshBtn.addEventListener('click', () => {
    updateMarketIndices({ userInitiated: true });
  });
}

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// testimonials (optional, only if elements exist on the page)
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

if (modalContainer && modalCloseBtn && overlay && testimonialsItem.length) {
  const modalImg = document.querySelector("[data-modal-img]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalText = document.querySelector("[data-modal-text]");

  const testimonialsModalFunc = function () {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  for (let i = 0; i < testimonialsItem.length; i++) {
    testimonialsItem[i].addEventListener("click", function () {
      const avatar = this.querySelector("[data-testimonials-avatar]");
      const title = this.querySelector("[data-testimonials-title]");
      const text = this.querySelector("[data-testimonials-text]");

      if (avatar && modalImg) {
        modalImg.src = avatar.src;
        modalImg.alt = avatar.alt;
      }
      if (title && modalTitle) {
        modalTitle.innerHTML = title.innerHTML;
      }
      if (text && modalText) {
        modalText.innerHTML = text.innerHTML;
      }

      testimonialsModalFunc();
    });
  }

  modalCloseBtn.addEventListener("click", testimonialsModalFunc);
  overlay.addEventListener("click", testimonialsModalFunc);
}

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

// Initialize roulette when projects page is active
function initAboutTypewriter() {
  const typewriterContainer = document.querySelector('[data-typewriter]');
  if (!typewriterContainer) {
    return;
  }

  const output = typewriterContainer.querySelector('.typewriter-output');
  const source = typewriterContainer.querySelector('[data-typewriter-source]');
  if (!output || !source) {
    return;
  }

  const segments = Array.from(source.querySelectorAll('p'));
  const normalizedSegments = segments
    .map(segment => segment.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (!normalizedSegments.length) {
    return;
  }

  const fullText = normalizedSegments.join('\n\n');
  let charIndex = 0;

  const baseDelay = Number(typewriterContainer.dataset.typewriterSpeed) || 28;
  const commaPause = Number(typewriterContainer.dataset.typewriterCommaPause) || 120;
  const sentencePause = Number(typewriterContainer.dataset.typewriterSentencePause) || 320;
  const initialDelay = Number(typewriterContainer.dataset.typewriterInitialDelay) || 400;
  const minimumDelay = 16;

  output.textContent = '';
  typewriterContainer.classList.add('typewriter-active');
  let hasStarted = false;

  function scheduleNext(delay) {
    window.setTimeout(typeNextChar, Math.max(delay, minimumDelay));
  }

  function typeNextChar() {
    if (charIndex >= fullText.length) {
      output.textContent = fullText;
      typewriterContainer.classList.add('typewriter-complete');
      return;
    }

    if (!hasStarted) {
      hasStarted = true;
      typewriterContainer.classList.add('typewriter-running');
      source.setAttribute('aria-hidden', 'true');
      source.hidden = true;
    }

    const nextIndex = charIndex + 1;
    output.textContent = fullText.slice(0, nextIndex);
    charIndex = nextIndex;

    if (charIndex >= fullText.length) {
      typewriterContainer.classList.add('typewriter-complete');
      return;
    }

    const currentChar = fullText.charAt(charIndex - 1);
    let delay = baseDelay;

    if ('.!?'.includes(currentChar)) {
      delay += sentencePause;
    } else if (',;:'.includes(currentChar)) {
      delay += commaPause;
    } else if (currentChar === '\n') {
      delay += commaPause;
    }

    scheduleNext(delay);
  }

  scheduleNext(initialDelay);
}

document.addEventListener('DOMContentLoaded', function() {
  initializeRoulette();
  initAboutTypewriter();

  const navigationLinks = document.querySelectorAll('[data-nav-link]');
  navigationLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (this.innerHTML.toLowerCase() === 'projects') {
        setTimeout(() => {
          initializeRoulette();
          updateMarketIndices();
        }, 250);
      }
    });
  });

  if (document.querySelector('.projects.active')) {
    setTimeout(() => {
      initializeRoulette();
      updateMarketIndices();
    }, 250);
  }
});

