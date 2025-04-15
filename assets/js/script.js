'use strict';

/**
 * Add event on element
 */
const addEventOnElem = function (elem, type, callback) {
  if (!elem) {
    console.warn("Element is null, skipping event listener:", type);
    return;
  }
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}

/**
 * Navbar toggle
 */
const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const navToggler = document.querySelector("[data-nav-toggler]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  navToggler.classList.toggle("active");
  document.body.classList.toggle("active");
};

addEventOnElem(navToggler, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  navToggler.classList.remove("active");
  document.body.classList.remove("active");
};

addEventOnElem(navbarLinks, "click", closeNavbar);

/**
 * Header active
 */
const header = document.querySelector("[data-header]");

const activeHeader = function () {
  if (window.scrollY > 300) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
};

addEventOnElem(window, "scroll", activeHeader);

/**
 * Toggle active on add to fav
 */
const addToFavBtns = document.querySelectorAll("[data-add-to-fav]");

const toggleActive = function () {
  this.classList.toggle("active");
};

addEventOnElem(addToFavBtns, "click", toggleActive);

/**
 * Scroll reveal effect
 */
const sections = document.querySelectorAll("[data-section]");

const scrollReveal = function () {
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].getBoundingClientRect().top < window.innerHeight / 1.5) {
      sections[i].classList.add("active");
    } else {
      sections[i].classList.remove("active");
    }
  }
};

scrollReveal();
addEventOnElem(window, "scroll", scrollReveal);

/**
 * Crypto price updates, charts, modal, and wallet
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded, script running");

  // Chart initialization function
  const createChart = (canvasId, label) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
      console.error(`Canvas element "${canvasId}" not found.`);
      return null;
    }
    return new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: label,
          data: [],
          borderColor: 'hsl(222, 100%, 61%)',
          borderWidth: 2,
          fill: false,
          pointRadius: 0
        }]
      },
      options: {
        scales: { x: { display: false }, y: { display: false } },
        plugins: { legend: { display: false } },
        maintainAspectRatio: false,
        animation: { duration: 0 }
      }
    });
  };

  // Initialize charts
  if (typeof Chart !== 'undefined') {
    const charts = {
      btc: createChart('btc-chart', 'BTC Price'),
      eth: createChart('eth-chart', 'ETH Price'),
      usdt: createChart('usdt-chart', 'USDT Price'),
      bnb: createChart('bnb-chart', 'BNB Price'),
      sol: createChart('sol-chart', 'SOL Price'),
      xrp: createChart('xrp-chart', 'XRP Price'),
      ada: createChart('ada-chart', 'ADA Price'),
      avax: createChart('avax-chart', 'AVAX Price')
    };

    // Fetch and update crypto data
    async function updateCryptoData() {
      try {
        console.log('Fetching crypto data...');
        const response = await fetch('https://crypto-wallet-i7zk.onrender.com/api/coingecko/markets', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors'
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch crypto data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const time = new Date().toLocaleTimeString();

        const coins = {
          bitcoin: { prefix: 'btc', elementIds: ['price', 'current', 'change', 'table-price', 'table-change', 'market-cap'] },
          ethereum: { prefix: 'eth', elementIds: ['price', 'current', 'change', 'table-price', 'table-change', 'market-cap'] },
          tether: { prefix: 'usdt', elementIds: ['price', 'current', 'change', 'table-price', 'table-change', 'market-cap'] },
          binancecoin: { prefix: 'bnb', elementIds: ['price', 'current', 'change', 'table-price', 'table-change', 'market-cap'] },
          solana: { prefix: 'sol', elementIds: ['table-price', 'table-change', 'market-cap'] },
          ripple: { prefix: 'xrp', elementIds: ['table-price', 'table-change', 'market-cap'] },
          cardano: { prefix: 'ada', elementIds: ['table-price', 'table-change', 'market-cap'] },
          'avalanche-2': { prefix: 'avax', elementIds: ['table-price', 'table-change', 'market-cap'] }
        };

        data.forEach(coin => {
          const config = coins[coin.id];
          if (!config) return;

          config.elementIds.forEach(id => {
            const element = document.getElementById(`${config.prefix}-${id}`);
            if (!element) {
              console.warn(`Element ${config.prefix}-${id} not found`);
              return;
            }
            if (id.includes('price') || id.includes('current')) {
              element.textContent = `${coin.current_price.toLocaleString()}`;
            } else if (id.includes('change')) {
              element.textContent = `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%`;
              element.classList.remove('green', 'red');
              element.classList.add(coin.price_change_percentage_24h >= 0 ? 'green' : 'red');
            } else if (id.includes('market-cap')) {
              element.textContent = `${coin.market_cap.toLocaleString()}`;
            }
          });

          if (charts[config.prefix]) {
            charts[config.prefix].data.labels.push(time);
            charts[config.prefix].data.datasets[0].data.push(coin.current_price);
            if (charts[config.prefix].data.labels.length > 20) {
              charts[config.prefix].data.labels.shift();
              charts[config.prefix].data.datasets[0].data.shift();
            }
            charts[config.prefix].update();
          }
        });
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        document.querySelectorAll('[id$="-price"], [id$="-current"], [id$="-table-price"]').forEach(el => {
          el.textContent = 'USD Error';
        });
      }
    }

    // Coin Modal functionality
    console.log("Setting up modal...");
    const modal = document.getElementById('coin-modal');
    const closeModalBtn = document.querySelector('.modal-close');
    const detailsBtns = document.querySelectorAll('.details-btn');

    console.log("Modal:", modal);
    console.log("Close button:", closeModalBtn);
    console.log("Details buttons count:", detailsBtns.length);

    const showModal = async function () {
      console.log("Details button clicked");
      const coinId = this.getAttribute('data-coin-id');
      console.log(`Fetching data for coin: ${coinId}`);
      try {
        const response = await fetch(`https://crypto-wallet-i7zk.onrender.com/api/coingecko/coins/${coinId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors'
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch coin data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Coin data fetched:", data);

        document.getElementById('modal-coin-logo').src = data.image.large;
        document.getElementById('modal-coin-name').textContent = data.name;
        document.getElementById('modal-price').textContent = `$${data.market_data.current_price.usd.toLocaleString()}`;
        document.getElementById('modal-change').textContent = `${data.market_data.price_change_percentage_24h >= 0 ? '+' : ''}${data.market_data.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('modal-change').classList.remove('green', 'red');
        document.getElementById('modal-change').classList.add(data.market_data.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('modal-market-cap').textContent = `$${data.market_data.market_cap.usd.toLocaleString()}`;
        document.getElementById('modal-circulating-supply').textContent = `${data.market_data.circulating_supply.toLocaleString()} ${data.symbol.toUpperCase()}`;
        document.getElementById('modal-volume').textContent = `$${data.market_data.total_volume.usd.toLocaleString()}`;
        document.getElementById('modal-ath').textContent = `$${data.market_data.ath.usd.toLocaleString()} (${new Date(data.market_data.ath_date.usd).toLocaleDateString()})`;
        document.getElementById('modal-description').innerHTML = data.description.en.split('. ')[0] + '.';

        if (modal) modal.classList.add('active');
        console.log("Modal opened");
      } catch (error) {
        console.error('Error fetching coin details:', error);
        alert('Failed to load coin details');
      }
    };

    const closeModal = function () {
      if (modal) modal.classList.remove('active');
      console.log("Modal closed");
    };

    addEventOnElem(detailsBtns, 'click', showModal);
    addEventOnElem(closeModalBtn, 'click', closeModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Wallet functionality
    console.log("Setting up wallet...");
    const walletBtn = document.getElementById('wallet-btn');
    const walletModal = document.getElementById('wallet-modal');
    const walletCloseBtn = document.querySelector('.wallet-modal-close');
    const createWalletBtn = document.getElementById('createWalletBtn');
    const walletList = document.getElementById('wallet-list');

    if (!walletBtn || !walletModal || !walletCloseBtn || !createWalletBtn || !walletList) {
      console.error("Wallet DOM elements missing:", {
        walletBtn: !!walletBtn,
        walletModal: !!walletModal,
        walletCloseBtn: !!walletCloseBtn,
        createWalletBtn: !!createWalletBtn,
        walletList: !!walletList
      });
    }

    let wallets = [];

    const loadWallets = async () => {
      if (!walletList) {
        console.error('Wallet list element not found');
        return;
      }
      try {
        console.log('Fetching wallets from /api/wallet/list');
        const response = await fetch('https://crypto-wallet-i7zk.onrender.com/api/wallet/list', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors'
        });
        if (!response.ok) {
          throw new Error(`Failed to load wallets: ${response.status} ${response.statusText}`);
        }
        wallets = await response.json();
        console.log('Loaded wallets:', wallets);
        displayWallets();
      } catch (error) {
        console.error('Error loading wallets:', error);
        walletList.innerHTML = '<p>Failed to load wallets. Please try again.</p>';
      }
    };

    const createWallet = async function () {
      if (!walletList) {
        console.error('Wallet list element not found');
        return;
      }
      try {
        console.log('Creating wallet via /api/wallet/create');
        const response = await fetch('https://crypto-wallet-i7zk.onrender.com/api/wallet/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({ userId: 'default' })
        });
        if (!response.ok) {
          throw new Error(`Failed to create wallet: ${response.status} ${response.statusText}`);
        }
        const wallet = await response.json();
        console.log('Created wallet:', wallet);
        await loadWallets();
      } catch (error) {
        console.error('Error creating wallet:', error);
        alert('Failed to create wallet: ' + error.message);
      }
    };

    const checkBalance = async function (index) {
      try {
        const address = wallets[index].address;
        console.log('Checking balance for:', address);
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
          throw new Error('Invalid wallet address');
        }
        const response = await fetch('https://crypto-wallet-i7zk.onrender.com/api/wallet/balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({ address })
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to check balance: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        const balanceSpan = document.getElementById(`balance-${index}`);
        if (balanceSpan) {
          balanceSpan.textContent = `${data.balance} ETH`;
        }
      } catch (error) {
        console.error('Error checking balance:', error);
        alert('Failed to check balance: ' + error.message);
      }
    };

    const sendTransaction = async function (event, index) {
      event.preventDefault();
      try {
        const toAddress = document.getElementById(`toAddress-${index}`).value;
        const amount = document.getElementById(`amount-${index}`).value;
        console.log('Sending transaction:', { toAddress, amount });
        const response = await fetch('https://crypto-wallet-i7zk.onrender.com/api/wallet/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({ privateKey: 'YOUR_TEST_PRIVATE_KEY', toAddress, amount })
        });
       if (!response.ok) {
          throw new Error(`Failed to send transaction: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const resultSpan = document.getElementById(`txResult-${index}`);
        if (resultSpan) {
          resultSpan.textContent = `Transaction sent: ${data.transactionHash}`;
        }
      } catch (error) {
        console.error('Error sending transaction:', error);
        alert('Failed to send transaction: ' + error.message);
      }
    };

    const displayWallets = function () {
      if (!walletList) {
        console.error('Wallet list element not found');
        return;
      }
      walletList.innerHTML = '';
      if (wallets.length === 0) {
        walletList.innerHTML = '<p>No wallets found.</p>';
        return;
      }
      wallets.forEach((wallet, index) => {
        const walletDiv = document.createElement('div');
        walletDiv.className = 'wallet-info';
        walletDiv.innerHTML = `
          <h2>Wallet ${index + 1}</h2>
          <p><strong>Address:</strong> <span id="address-${index}">${wallet.address || 'N/A'}</span></p>
          <p><strong>Balance:</strong> <span id="balance-${index}">0.0 ETH</span></p>
          <button class="check-balance-btn" data-index="${index}">Check Balance</button>
          <div class="send-transaction">
            <h3>Send Transaction</h3>
            <form id="send-form-${index}">
              <input type="text" id="toAddress-${index}" placeholder="Recipient Address" required>
              <input type="number" id="amount-${index}" step="0.001" placeholder="Amount in ETH" required>
              <button type="submit" class="send-btn" data-index="${index}">Send</button>
            </form>
            <p><strong>Result:</strong> <span id="txResult-${index}"></span></p>
          </div>
        `;
        walletList.appendChild(walletDiv);
        const checkBalanceBtn = walletDiv.querySelector('.check-balance-btn');
        const sendForm = walletDiv.querySelector(`#send-form-${index}`);
        addEventOnElem(checkBalanceBtn, 'click', () => checkBalance(index));
        addEventOnElem(sendForm, 'submit', (event) => sendTransaction(event, index));
      });
    };

    // Open wallet modal
    addEventOnElem(walletBtn, 'click', () => {
      console.log('Wallet button clicked');
      if (walletModal) {
        walletModal.classList.add('active');
        loadWallets();
      } else {
        console.error('Wallet modal not found');
      }
    });

    // Close wallet modal
    addEventOnElem(walletCloseBtn, 'click', () => {
      console.log('Close wallet modal clicked');
      if (walletModal) {
        walletModal.classList.remove('active');
      }
    });

    // Create wallet
    if (createWalletBtn) {
      console.log('Binding createWalletBtn');
      addEventOnElem(createWalletBtn, 'click', () => {
        console.log('Create Wallet clicked');
        createWallet();
      });
    }

    // Initialize
    updateCryptoData();
    setInterval(updateCryptoData, 60000);
  } else {
    console.error("Chart.js not loaded. Chart functionality will be skipped.");
  }
});