// quant.js - extracted custom scripts
(function(){
  // Theme toggle
  const body = document.body;
  const toggleBtn = document.getElementById('theme-toggle');
  function applyTheme(theme) {
    body.classList.remove('theme-light', 'theme-dark');
    const icon = toggleBtn && toggleBtn.querySelector('ion-icon');
    if (theme === 'light') {
      body.classList.add('theme-light');
      if (icon) icon.setAttribute('name', 'sunny');
    } else {
      body.classList.add('theme-dark');
      if (icon) icon.setAttribute('name', 'moon');
    }
  }

  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(storedTheme || (prefersDark ? 'dark' : 'light'));

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isLight = body.classList.contains('theme-light');
      const next = isLight ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  // Market Ticker Script
  const tickerContainer = document.getElementById('ticker-container');
  if (tickerContainer) {
    const marketData = [
      { symbol: 'AAPL', price: 150.25, change: '+1.52%' },
      { symbol: 'GOOGL', price: 2750.80, change: '-0.75%' },
      { symbol: 'MSFT', price: 305.40, change: '+0.95%' },
      { symbol: 'AMZN', price: 3400.10, change: '+2.10%' },
      { symbol: 'TSLA', price: 700.60, change: '-3.20%' },
      { symbol: 'NVDA', price: 200.50, change: '+4.50%' },
      { symbol: 'SPY', price: 450.30, change: '+0.80%' },
      { symbol: 'QQQ', price: 380.90, change: '+1.10%' },
      { symbol: 'IWM', price: 220.40, change: '+0.60%' },
      { symbol: 'VIX', price: 16.50, change: '-5.50%' }
    ];

    function createTickerItem(item) {
      const changeClass = item.change.startsWith('+') ? 'positive' : 'negative';
      return `
        <div class="ticker-item">
          <span class="ticker-symbol">${item.symbol}</span>
          <span class="ticker-price">${Number(item.price).toFixed(2)}</span>
          <span class="ticker-change ${changeClass}">${item.change}</span>
        </div>
      `;
    }

    function populateTicker() {
      const tickerContent = [...marketData, ...marketData, ...marketData, ...marketData]
        .map(createTickerItem)
        .join('');
      tickerContainer.innerHTML = tickerContent;
    }

    populateTicker();
  }

  // Terminal script (skills)
  const terminal = document.getElementById('terminal');
  if (terminal) {
    const lines = [
      { text: './fetch-skills.sh', isCommand: true },
      { text: 'Fetching skills...', isCommand: false },
      { text: 'Languages: Python, Java, C/C++, SQL, JavaScript', isCommand: false },
      { text: 'Frameworks: PyTorch, TensorFlow, Scikit-learn, Streamlit, Flask', isCommand: false },
      { text: 'Tools: Git, Docker, MATLAB, R, Excel', isCommand: false },
      { text: 'Interests: Quantitative Finance, HFT, Machine Learning, Algo-Trading', isCommand: false },
      { text: 'Status: Ready', isCommand: false }
    ];

    let lineIndex = 0;
    let charIndex = 0;

    function typeLine() {
      if (lineIndex < lines.length) {
        const currentLine = lines[lineIndex];
        const lineElement = document.createElement('div');
        lineElement.classList.add('terminal-line');

        if (currentLine.isCommand) {
          lineElement.innerHTML = `<span class="command">${currentLine.text}</span><span class="cursor"></span>`;
          terminal.appendChild(lineElement);
          setTimeout(() => {
            const c = lineElement.querySelector('.cursor');
            if (c) c.remove();
            lineIndex++;
            setTimeout(typeLine, 200);
          }, 1000);
        } else {
          lineElement.innerHTML = `<span class="output"></span><span class="cursor"></span>`;
          terminal.appendChild(lineElement);
          typeChar(lineElement.querySelector('.output'), currentLine.text);
        }
      }
    }

    function typeChar(outputElement, text) {
      if (!outputElement) return;
      if (charIndex < text.length) {
        outputElement.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(() => typeChar(outputElement, text), 40);
      } else {
        const c = outputElement.parentElement && outputElement.parentElement.querySelector('.cursor');
        if (c) c.remove();
        charIndex = 0;
        lineIndex++;
        setTimeout(typeLine, 150);
      }
    }

    typeLine();
  }

  // Financial Dashboard
  const sp500Value = document.getElementById('sp500-value');
  const nasdaqValue = document.getElementById('nasdaq-value');
  const vixValue = document.getElementById('vix-value');
  const treasuryValue = document.getElementById('treasury-value');

  function updateMarketData() {
    if (!(sp500Value && nasdaqValue && vixValue && treasuryValue)) return;
    const baseSP = 5203.58;
    const baseNas = 16428.82;
    const baseVix = 16.72;
    const baseTreas = 4.32;

    // S&P 500
    const sp500 = baseSP * (1 + (Math.random() - 0.5) * 0.01);
    const sp500Change = ((sp500 / baseSP) - 1) * 100;
    sp500Value.innerHTML = `${sp500.toFixed(2)} <span style="color: ${sp500Change >= 0 ? '#0acf97' : '#fa5c7c'};">${sp500Change.toFixed(2)}%</span>`;

    // NASDAQ
    const nasdaq = baseNas * (1 + (Math.random() - 0.5) * 0.015);
    const nasdaqChange = ((nasdaq / baseNas) - 1) * 100;
    nasdaqValue.innerHTML = `${nasdaq.toFixed(2)} <span style="color: ${nasdaqChange >= 0 ? '#0acf97' : '#fa5c7c'};">${nasdaqChange.toFixed(2)}%</span>`;

    // VIX (inverse color scheme)
    const vix = baseVix * (1 + (Math.random() - 0.5) * 0.05);
    const vixChange = ((vix / baseVix) - 1) * 100;
    vixValue.innerHTML = `${vix.toFixed(2)} <span style="color: ${vixChange >= 0 ? '#fa5c7c' : '#0acf97'};">${vixChange.toFixed(2)}%</span>`;

    // 10Y Treasury (bps-like)
    const treasury = baseTreas + (Math.random() - 0.5) * 0.1;
    const treasuryChange = treasury - baseTreas;
    treasuryValue.innerHTML = `${treasury.toFixed(2)}% <span style="color: ${treasuryChange >= 0 ? '#fa5c7c' : '#0acf97'};">${treasuryChange.toFixed(2)}</span>`;
  }

  setInterval(updateMarketData, 2000);
  updateMarketData();

  // Chart.js line chart if canvas exists
  const canvas = document.getElementById('marketChart');
  if (canvas && window.Chart) {
    const ctx = canvas.getContext('2d');
    const marketChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 10 }, (_, i) => `T-${9 - i}`),
        datasets: [{
          label: 'S&P 500',
          data: Array.from({ length: 10 }, () => 5200 + (Math.random() - 0.5) * 100),
          borderColor: 'rgba(79, 209, 197, 1)',
          backgroundColor: 'rgba(79, 209, 197, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)' } },
          y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)' } }
        }
      }
    });

    let time = 0;
    function updateChart() {
      marketChart.data.labels.shift();
      marketChart.data.labels.push(`T+${time++}`);
      marketChart.data.datasets[0].data.shift();
      marketChart.data.datasets[0].data.push(5203.58 * (1 + (Math.random() - 0.5) * 0.01));
      marketChart.update('quiet');
    }
    setInterval(updateChart, 2000);
  }

  // Interests gallery lightbox with swipe
  (function setupGalleryLightbox(){
    const gallery = document.querySelector('.interest-gallery');
    const lightbox = document.getElementById('interest-lightbox');
    if (!gallery || !lightbox) return;
    const imgEl = lightbox.querySelector('#glb-img');
    const captionEl = lightbox.querySelector('#glb-caption');
    const btnClose = lightbox.querySelector('.glb-close');
    const btnPrev = lightbox.querySelector('.glb-prev');
    const btnNext = lightbox.querySelector('.glb-next');
    const items = Array.from(gallery.querySelectorAll('.gallery-item'));
    let index = 0;

    function show(i){
      index = (i + items.length) % items.length;
      const fig = items[index];
      const img = fig.querySelector('img');
      const caption = fig.querySelector('figcaption');
      imgEl.src = img.src;
      imgEl.alt = img.alt || 'Gallery image';
      if (captionEl) captionEl.textContent = caption ? caption.textContent : '';
    }

    function open(i){
      show(i);
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function close(){
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    items.forEach((fig, i)=>{
      fig.addEventListener('click', ()=> open(i));
      fig.addEventListener('keydown', (e)=>{ if (e.key==='Enter' || e.key===' ') { e.preventDefault(); open(i);} });
      fig.setAttribute('tabindex','0');
      fig.setAttribute('role','button');
      fig.setAttribute('aria-label','Open image');
    });

    btnClose && btnClose.addEventListener('click', close);
    btnPrev && btnPrev.addEventListener('click', ()=> show(index-1));
    btnNext && btnNext.addEventListener('click', ()=> show(index+1));
    lightbox.addEventListener('click', (e)=>{ if (e.target === lightbox) close(); });

    // Keyboard navigation
    window.addEventListener('keydown', (e)=>{
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index-1);
      else if (e.key === 'ArrowRight') show(index+1);
    });

    // Touch swipe (basic)
    let startX = 0; let startY = 0; let swiping = false;
    function onTouchStart(ev){
      if (!lightbox.classList.contains('active')) return;
      const t = ev.touches ? ev.touches[0] : ev;
      startX = t.clientX; startY = t.clientY; swiping = true;
    }
    function onTouchMove(ev){ if (!swiping) return; }
    function onTouchEnd(ev){
      if (!swiping) return; swiping = false;
      const t = ev.changedTouches ? ev.changedTouches[0] : ev;
      const dx = t.clientX - startX; const dy = t.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) show(index+1); else show(index-1);
      }
    }
    lightbox.addEventListener('touchstart', onTouchStart, {passive:true});
    lightbox.addEventListener('touchmove', onTouchMove, {passive:true});
    lightbox.addEventListener('touchend', onTouchEnd);
  })();

  // Interests single-image slider: autoplay + click/swipe next
  (function setupInterestSlider(){
    const slider = document.getElementById('interest-slider');
    if (!slider) return;
    const slides = Array.from(slider.querySelectorAll('.slide'));
    let idx = slides.findIndex(s => s.classList.contains('active'));
    if (idx < 0) idx = 0;
    let timer;

    function show(i){
      slides[idx].classList.remove('active');
      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add('active');
    }

    function next(){ show(idx + 1); }

    function start(){ stop(); timer = setInterval(next, 3500); }
    function stop(){ if (timer) clearInterval(timer); }

    // Autoplay
    start();

    // Click to next
    slider.addEventListener('click', () => { next(); start(); });

    // Swipe
    let sx = 0, sy = 0, swiping = false;
    slider.addEventListener('touchstart', (e) => {
      const t = e.touches[0]; sx = t.clientX; sy = t.clientY; swiping = true; stop();
    }, {passive:true});
    slider.addEventListener('touchmove', (e) => {}, {passive:true});
    slider.addEventListener('touchend', (e) => {
      if (!swiping) return; swiping = false;
      const t = e.changedTouches[0]; const dx = t.clientX - sx; const dy = t.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(); else show(idx - 1);
      } else {
        // treat as tap
        next();
      }
      start();
    });

    // Pause on hover (desktop)
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
  })();
})();
