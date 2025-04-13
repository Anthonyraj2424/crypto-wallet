const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const ethers = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const express = require('express');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(express.json());
app.get('/api/wallet/list', async (req, res) => {
  const wallets = await Wallet.find({ userId: 'default' });
  res.json(wallets);
});

// Wallet schema
const walletSchema = new mongoose.Schema({
  userId: { type: String, default: 'default' }, // Placeholder for auth
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
    res.json({
      address: savedWallet.address,
      privateKey: savedWallet.privateKey,
      mnemonic: savedWallet.mnemonic
    });
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
    const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/a68053a6d40d4f6f8f2fda942068a4ba');
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
    const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/a68053a6d40d4f6f8f2fda942068a4ba');
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