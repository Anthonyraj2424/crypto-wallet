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
});

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
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,avalanche-2&order=market_cap_desc&per_page=8&page=1&sparkline=false'
        );
        const data = await response.json();
        const time = new Date().toLocaleTimeString();

        const btc = data.find(coin => coin.id === 'bitcoin');
        document.getElementById('btc-price').innerText = `USD ${btc.current_price.toLocaleString()}`;
        document.getElementById('btc-current').innerText = btc.current_price.toLocaleString();
        document.getElementById('btc-change').innerText = `${btc.price_change_percentage_24h >= 0 ? '+' : ''}${btc.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('btc-change').classList.remove('green', 'red');
        document.getElementById('btc-change').classList.add(btc.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('btc-table-price').innerText = `$${btc.current_price.toLocaleString()}`;
        document.getElementById('btc-table-change').innerText = `${btc.price_change_percentage_24h >= 0 ? '+' : ''}${btc.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('btc-table-change').classList.remove('green', 'red');
        document.getElementById('btc-table-change').classList.add(btc.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('btc-market-cap').innerText = `$${btc.market_cap.toLocaleString()}`;
        if (charts.btc) {
          charts.btc.data.labels.push(time);
          charts.btc.data.datasets[0].data.push(btc.current_price);
          if (charts.btc.data.labels.length > 20) {
            charts.btc.data.labels.shift();
            charts.btc.data.datasets[0].data.shift();
          }
          charts.btc.update();
        }

        const eth = data.find(coin => coin.id === 'ethereum');
        document.getElementById('eth-price').innerText = `USD ${eth.current_price.toLocaleString()}`;
        document.getElementById('eth-current').innerText = eth.current_price.toLocaleString();
        document.getElementById('eth-change').innerText = `${eth.price_change_percentage_24h >= 0 ? '+' : ''}${eth.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('eth-change').classList.remove('green', 'red');
        document.getElementById('eth-change').classList.add(eth.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('eth-table-price').innerText = `$${eth.current_price.toLocaleString()}`;
        document.getElementById('eth-table-change').innerText = `${eth.price_change_percentage_24h >= 0 ? '+' : ''}${eth.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('eth-table-change').classList.remove('green', 'red');
        document.getElementById('eth-table-change').classList.add(eth.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('eth-market-cap').innerText = `$${eth.market_cap.toLocaleString()}`;
        if (charts.eth) {
          charts.eth.data.labels.push(time);
          charts.eth.data.datasets[0].data.push(eth.current_price);
          if (charts.eth.data.labels.length > 20) {
            charts.eth.data.labels.shift();
            charts.eth.data.datasets[0].data.shift();
          }
          charts.eth.update();
        }

        const usdt = data.find(coin => coin.id === 'tether');
        document.getElementById('usdt-price').innerText = `USD ${usdt.current_price.toLocaleString()}`;
        document.getElementById('usdt-current').innerText = usdt.current_price.toLocaleString();
        document.getElementById('usdt-change').innerText = `${usdt.price_change_percentage_24h >= 0 ? '+' : ''}${usdt.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('usdt-change').classList.remove('green', 'red');
        document.getElementById('usdt-change').classList.add(usdt.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('usdt-table-price').innerText = `$${usdt.current_price.toLocaleString()}`;
        document.getElementById('usdt-table-change').innerText = `${usdt.price_change_percentage_24h >= 0 ? '+' : ''}${usdt.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('usdt-table-change').classList.remove('green', 'red');
        document.getElementById('usdt-table-change').classList.add(usdt.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('usdt-market-cap').innerText = `$${usdt.market_cap.toLocaleString()}`;
        if (charts.usdt) {
          charts.usdt.data.labels.push(time);
          charts.usdt.data.datasets[0].data.push(usdt.current_price);
          if (charts.usdt.data.labels.length > 20) {
            charts.usdt.data.labels.shift();
            charts.usdt.data.datasets[0].data.shift();
          }
          charts.usdt.update();
        }

        const bnb = data.find(coin => coin.id === 'binancecoin');
        document.getElementById('bnb-price').innerText = `USD ${bnb.current_price.toLocaleString()}`;
        document.getElementById('bnb-current').innerText = bnb.current_price.toLocaleString();
        document.getElementById('bnb-change').innerText = `${bnb.price_change_percentage_24h >= 0 ? '+' : ''}${bnb.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('bnb-change').classList.remove('green', 'red');
        document.getElementById('bnb-change').classList.add(bnb.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('bnb-table-price').innerText = `$${bnb.current_price.toLocaleString()}`;
        document.getElementById('bnb-table-change').innerText = `${bnb.price_change_percentage_24h >= 0 ? '+' : ''}${bnb.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('bnb-table-change').classList.remove('green', 'red');
        document.getElementById('bnb-table-change').classList.add(bnb.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('bnb-market-cap').innerText = `$${bnb.market_cap.toLocaleString()}`;
        if (charts.bnb) {
          charts.bnb.data.labels.push(time);
          charts.bnb.data.datasets[0].data.push(bnb.current_price);
          if (charts.bnb.data.labels.length > 20) {
            charts.bnb.data.labels.shift();
            charts.bnb.data.datasets[0].data.shift();
          }
          charts.bnb.update();
        }

        const sol = data.find(coin => coin.id === 'solana');
        document.getElementById('sol-table-price').innerText = `${sol.current_price.toLocaleString()}`;
        document.getElementById('sol-table-change').innerText = `${sol.price_change_percentage_24h >= 0 ? '+' : ''}${sol.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('sol-table-change').classList.remove('green', 'red');
        document.getElementById('sol-table-change').classList.add(sol.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('sol-market-cap').innerText = `${sol.market_cap.toLocaleString()}`;
        if (charts.sol) {
          charts.sol.data.labels.push(time);
          charts.sol.data.datasets[0].data.push(sol.current_price);
          if (charts.sol.data.labels.length > 20) {
            charts.sol.data.labels.shift();
            charts.sol.data.datasets[0].data.shift();
          }
          charts.sol.update();
        }

        const xrp = data.find(coin => coin.id === 'ripple');
        document.getElementById('xrp-table-price').innerText = `$${xrp.current_price.toLocaleString()}`;
        document.getElementById('xrp-table-change').innerText = `${xrp.price_change_percentage_24h >= 0 ? '+' : ''}${xrp.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('xrp-table-change').classList.remove('green', 'red');
        document.getElementById('xrp-table-change').classList.add(xrp.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('xrp-market-cap').innerText = `$${xrp.market_cap.toLocaleString()}`;
        if (charts.xrp) {
          charts.xrp.data.labels.push(time);
          charts.xrp.data.datasets[0].data.push(xrp.current_price);
          if (charts.xrp.data.labels.length > 20) {
            charts.xrp.data.labels.shift();
            charts.xrp.data.datasets[0].data.shift();
          }
          charts.xrp.update();
        }

        const ada = data.find(coin => coin.id === 'cardano');
        document.getElementById('ada-table-price').innerText = `$${ada.current_price.toLocaleString()}`;
        document.getElementById('ada-table-change').innerText = `${ada.price_change_percentage_24h >= 0 ? '+' : ''}${ada.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('ada-table-change').classList.remove('green', 'red');
        document.getElementById('ada-table-change').classList.add(ada.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('ada-market-cap').innerText = `$${ada.market_cap.toLocaleString()}`;
        if (charts.ada) {
          charts.ada.data.labels.push(time);
          charts.ada.data.datasets[0].data.push(ada.current_price);
          if (charts.ada.data.labels.length > 20) {
            charts.ada.data.labels.shift();
            charts.ada.data.datasets[0].data.shift();
          }
          charts.ada.update();
        }

        const avax = data.find(coin => coin.id === 'avalanche-2');
        document.getElementById('avax-table-price').innerText = `$${avax.current_price.toLocaleString()}`;
        document.getElementById('avax-table-change').innerText = `${avax.price_change_percentage_24h >= 0 ? '+' : ''}${avax.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('avax-table-change').classList.remove('green', 'red');
        document.getElementById('avax-table-change').classList.add(avax.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('avax-market-cap').innerText = `$${avax.market_cap.toLocaleString()}`;
        if (charts.avax) {
          charts.avax.data.labels.push(time);
          charts.avax.data.datasets[0].data.push(avax.current_price);
          if (charts.avax.data.labels.length > 20) {
            charts.avax.data.labels.shift();
            charts.avax.data.datasets[0].data.shift();
          }
          charts.avax.update();
        }
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    }

    updateCryptoData();
    setInterval(updateCryptoData, 10000);

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
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        const data = await response.json();
        console.log("Coin data fetched:", data);

        document.getElementById('modal-coin-logo').src = data.image.large;
        document.getElementById('modal-coin-name').innerText = data.name;
        document.getElementById('modal-price').innerText = `$${data.market_data.current_price.usd.toLocaleString()}`;
        document.getElementById('modal-change').innerText = `${data.market_data.price_change_percentage_24h >= 0 ? '+' : ''}${data.market_data.price_change_percentage_24h.toFixed(2)}%`;
        document.getElementById('modal-change').classList.remove('green', 'red');
        document.getElementById('modal-change').classList.add(data.market_data.price_change_percentage_24h >= 0 ? 'green' : 'red');
        document.getElementById('modal-market-cap').innerText = `$${data.market_data.market_cap.usd.toLocaleString()}`;
        document.getElementById('modal-circulating-supply').innerText = `${data.market_data.circulating_supply.toLocaleString()} ${data.symbol.toUpperCase()}`;
        document.getElementById('modal-volume').innerText = `$${data.market_data.total_volume.usd.toLocaleString()}`;
        document.getElementById('modal-ath').innerText = `$${data.market_data.ath.usd.toLocaleString()} (${new Date(data.market_data.ath_date.usd).toLocaleDateString()})`;
        document.getElementById('modal-description').innerHTML = data.description.en.split('. ')[0] + '.';

        if (modal) modal.classList.add('active');
        console.log("Modal opened");
      } catch (error) {
        console.error('Error fetching coin details:', error);
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
  } else {
    console.error("Chart.js not loaded. Chart functionality will be skipped.");
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
    const response = await fetch('https://crypto-dashboard-backend.onrender.com/api/wallet/list', {
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
    const response = await fetch('https://crypto-dashboard-backend.onrender.com/api/wallet/create', {
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
    const response = await fetch('https://crypto-dashboard-backend.onrender.com/api/wallet/balance', {
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
    const privateKey = wallets[index].privateKey || 'dummy-key';
    console.log('Sending transaction:', { toAddress, amount });
    const response = await fetch('https://crypto-dashboard-backend.onrender.com/api/wallet/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({ privateKey, toAddress, amount })
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
      <p><strong>Private Key:</strong> <span id="privateKey-${index}" class="hidden">${wallet.privateKey || 'Not available'}</span>
      <button class="toggle-key" data-index="${index}">Show Private Key</button></p>
      <p><strong>Mnemonic:</strong> <span id="mnemonic-${index}" class="hidden">${wallet.mnemonic || 'Not available'}</span>
      <button class="toggle-mnemonic" data-index="${index}">Show Mnemonic</button></p>
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
    const toggleKeyBtn = walletDiv.querySelector(`.toggle-key[data-index="${index}"]`);
    const toggleMnemonicBtn = walletDiv.querySelector(`.toggle-mnemonic[data-index="${index}"]`);
    addEventOnElem(checkBalanceBtn, 'click', () => checkBalance(index));
    addEventOnElem(sendForm, 'submit', (event) => sendTransaction(event, index));
    addEventOnElem(toggleKeyBtn, 'click', () => {
      const keySpan = document.getElementById(`privateKey-${index}`);
      keySpan.classList.toggle('hidden');
      keySpan.classList.contains('hidden') ? toggleKeyBtn.textContent = 'Show Private Key' : toggleKeyBtn.textContent = 'Hide Private Key';
    });
    addEventOnElem(toggleMnemonicBtn, 'click', () => {
      const mnemonicSpan = document.getElementById(`mnemonic-${index}`);
      mnemonicSpan.classList.toggle('hidden');
      mnemonicSpan.classList.contains('hidden') ? toggleMnemonicBtn.textContent = 'Show Mnemonic' : toggleMnemonicBtn.textContent = 'Hide Mnemonic';
    });
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