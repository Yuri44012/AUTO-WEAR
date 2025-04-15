const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;
const accessories = [607702162, 2646473721]; // Accessory IDs

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Main API endpoint
app.post('/autowear', async (req, res) => {
  const { roblosecurity } = req.body;

  if (!roblosecurity) {
    return res.status(400).json({ error: 'Missing .ROBLOSECURITY cookie' });
  }

  try {
    const result = await autoWear(roblosecurity);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to wear accessories',
      details: err.message,
    });
  }
});

// Puppeteer function
async function autoWear(cookie) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.setCookie({
    name: '.ROBLOSECURITY',
    value: cookie,
    domain: '.roblox.com',
    httpOnly: true,
    secure: true,
  });

  try {
    await page.goto('https://www.roblox.com/home', { waitUntil: 'networkidle2' });

    const results = [];

    for (const assetId of accessories) {
      const result = await page.evaluate(async (assetId) => {
        const response = await fetch('https://avatar.roblox.com/v1/avatar/assets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assetId }),
        });
        return await response.json();
      }, assetId);

      results.push({ assetId, result });
    }

    return results;
  } catch (err) {
    throw new Error('Puppeteer failed: ' + err.message);
  } finally {
    await browser.close();
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
