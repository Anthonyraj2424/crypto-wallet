const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const ethers = require('ethers');

const app = express();
app.use(cors({
  origin: ['https://crypto-wallet-six-rho.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Debug environment
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
    const wallets = await Wallet.find({ userId: 'default' }).select('-privateKey -mnemonic');
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wallet/balance', async (req, res) => {
  try {
    if (!process.env.INFURA_KEY) {
      throw new Error('INFURA_KEY is not configured');
    }
    const { address } = req.body;
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
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
    const { privateKey, toAddress, amount } = req.body;
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid Ethereum address');
    }
    const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/' + process.env.INFURA_KEY);
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount)
    });
    const receipt = await tx.wait();
    res.json({ transactionHash: receipt.hash });
  } catch (error) {
    console.error('Error sending transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));

// Fetch wallets
fetch('https://crypto-wallet-backend.onrender.com/api/wallet/list')
  .then(response => response.json())
  .then(wallets => {
    console.log(wallets);
    // TODO: Update DOM (e.g., <div id="wallet-list">)
  })
  .catch(error => console.error('Error:', error));

// Create wallet (e.g., on button click)
function createWallet() {
  fetch('https://crypto-wallet-backend.onrender.com/api/wallet/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'default' })
  })
    .then(response => response.json())
    .then(data => {
      console.log('Created:', data.address);
      // TODO: Refresh wallet list
    })
    .catch(error => console.error('Error:', error));
}