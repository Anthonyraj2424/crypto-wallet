const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const ethers = require('ethers');
const fetch = require('node-fetch');

const app = express();
app.use(cors({
  origin: [
    'https://crypto-wallet-aaqgaev41-anthony-rajs-projects.vercel.app',
    'https://crypto-wallet-six-rho.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());

console.log('Starting server...');
console.log('INFURA_KEY set:', !!process.env.INFURA_KEY);
console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const walletSchema = new mongoose.Schema({
  userId: { type: String, default: 'default' },
  address: { type: String, required: true },
  privateKey: { type: String, required: true },
  mnemonic: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Wallet = mongoose.model('Wallet', walletSchema);

app.post('/api/wallet/create', async (req, res) => {
  try {
    const wallet = ethers.Wallet.createRandom();
    const walletData = {
      userId: req.body.userId || 'default',
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase
    };
    const savedWallet = await Wallet.create(walletData);
    res.json({ address: savedWallet.address });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wallet/list', async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: 'default' }).select('address');
    res.json(wallets);
  } catch (error) {
    console.error('Error listing wallets:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wallet/balance', async (req, res) => {
  try {
    if (!process.env.INFURA_KEY) {
      throw new Error('INFURA_KEY is not configured');
    }
    const { address } = req.body;
    console.log('Balance request:', { address });
    if (!address) {
      throw new Error('Address is missing');
    }
    if (!ethers.isAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }
    const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/' + process.env.INFURA_KEY);
    const balance = await provider.getBalance(address);
    res.json({ balance: ethers.formatEther(balance) });
  } catch (error) {
    console.error('Error checking balance:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wallet/send', async (req, res) => {
  try {
    if (!process.env.INFURA_KEY) {
      throw new Error('INFURA_KEY is not configured');
    }
    const { toAddress, amount } = req.body;
    console.log('Send transaction request:', { toAddress, amount });
    if (!toAddress || !amount) {
      throw new Error('Missing toAddress or amount');
    }
    if (!ethers.isAddress(toAddress)) {
      throw new Error(`Invalid recipient address: ${toAddress}`);
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Invalid amount');
    }
    const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/' + process.env.INFURA_KEY);
    const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);
    const tx = {
      to: toAddress,
      value: ethers.parseEther(amount)
    };
    const txResponse = await wallet.sendTransaction(tx);
    const receipt = await txResponse.wait();
    res.json({ transactionHash: receipt.hash });
  } catch (error) {
    console.error('Error sending transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/coingecko/markets', async (req, res) => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,avalanche-2&order=market_cap_desc&per_page=8&page=1&sparkline=false');
    if (!response.ok) {
      throw new Error('Failed to fetch CoinGecko data');
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching CoinGecko:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/coingecko/coins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch coin data');
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching coin:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));