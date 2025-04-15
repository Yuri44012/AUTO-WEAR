const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.post('/autowear', async (req, res) => {
  const { roblosecurity } = req.body;

  if (!roblosecurity) {
    return res.status(400).json({ error: 'Missing .ROBLOSECURITY cookie' });
  }

  const accessories = [607702162, 2646473721];
  const baseUrl = 'https://avatar.roblox.com/v1/avatar/assets';

  try {
    // Step 1: Get CSRF Token
    let csrfToken = '';
    try {
      await axios.post(
        baseUrl,
        { assetId: accessories[0] },
        {
          headers: {
            Cookie: `.ROBLOSECURITY=${roblosecurity}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (err) {
      csrfToken = err.response.headers['x-csrf-token'];
    }

    if (!csrfToken) {
      return res.status(500).json({ error: 'Failed to retrieve CSRF token' });
    }

    // Step 2: Send authenticated POST requests
    for (let assetId of accessories) {
      await axios.post(
        baseUrl,
        { assetId },
        {
          headers: {
            Cookie: `.ROBLOSECURITY=${roblosecurity}`,
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
