const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const ethers = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Wallet schema
const walletSchema = new mongoose.Schema({
  userId: { type: String, default: 'default' },
  address: { type: String, required: true },
  privateKey: { type: String, required: true },
  mnemonic: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Wallet = mongoose.model('Wallet', walletSchema);

// Create wallet
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

// List wallets
app.get('/api/wallet/list', async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: 'default' }).select('-privateKey -mnemonic');
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check balance
app.post('/api/wallet/balance', async (req, res) => {
  try {
    const { address } = req.body;
    const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL || 'https://sepolia.infura.io/v3/' + process.env.INFURA_KEY);
    const balance = await provider.getBalance(address);
    res.json({ balance: ethers.formatEther(balance) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send transaction
app.post('/api/wallet/send', async (req, res) => {
  try {
    const { privateKey, toAddress, amount } = req.body;
    const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL || 'https://sepolia.infura.io/v3/' + process.env.INFURA_KEY);
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount)
    });
    const receipt = await tx.wait();
    res.json({ transactionHash: receipt.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));