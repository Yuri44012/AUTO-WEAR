const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const WEAR_API = 'https://avatar.roblox.com/v1/avatar/assets';

app.post('/autowear', async (req, res) => {
  const { roblosecurity } = req.body;

  if (!roblosecurity) {
    return res.status(400).json({ error: 'Missing .ROBLOSECURITY cookie' });
  }

  try {
    const accessories = [607702162, 2646473721];

    for (let assetId of accessories) {
      await axios.post(
        WEAR_API,
        { assetId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `.ROBLOSECURITY=${roblosecurity}`
          }
        }
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to wear accessories',
      details: err.response?.data || err.message
    });
  }
});

// Handle root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
