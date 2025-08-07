const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 7171;

// CORS headers to match Cloudflare Worker
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// Handle preflight requests (OPTIONS)
app.options('*', (req, res) => {
  res.set(corsHeaders).status(204).send();
});

// Handle GET requests (browser access)
app.get('/', (req, res) => {
  res.set({ 'Content-Type': 'text/plain', ...corsHeaders }).status(200)
    .send('Miko is on duty! The All-in-One Gemini Balance Worker is running perfectly.');
});

// Handle POST requests (API forwarding)
app.post('*', async (req, res) => {
  try {
    // Get API keys from environment variables
    const apiKeys = (process.env.GEMINI_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
    
    if (apiKeys.length === 0) {
      return res.set(corsHeaders).status(500)
        .send('GEMINI_API_KEYS environment variable is not set or empty.');
    }
    
    // Randomly select an API key
    const selectedApiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    
    // Target API URL
    const googleApiUrl = 'https://generativelanguage.googleapis.com';
    const targetPath = req.path;
    const targetUrl = `${googleApiUrl}${targetPath}?key=${selectedApiKey}`;
    
    // Prepare headers for the upstream request
    const upstreamHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Forward the request
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: upstreamHeaders,
      body: req.body instanceof Buffer ? req.body : JSON.stringify(req.body),
    });
    
    // Create a new response with the upstream response data and add CORS headers
    const responseData = await response.arrayBuffer();
    
    // Set headers for the response
    const responseHeaders = {};
    for (const [key, value] of response.headers.entries()) {
      responseHeaders[key] = value;
    }
    
    // Add CORS headers
    Object.assign(responseHeaders, corsHeaders);
    
    // Send response with proper status code and headers
    res.set(responseHeaders).status(response.status).send(Buffer.from(responseData));
  } catch (error) {
    console.error('Error forwarding request:', error);
    res.set(corsHeaders).status(500).send('Internal Server Error');
  }
});

// Handle all other methods
app.all('*', (req, res) => {
  res.set(corsHeaders).status(405).send('Method Not Allowed');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gemini Load Balancer is running on http://localhost:${PORT}`);
});