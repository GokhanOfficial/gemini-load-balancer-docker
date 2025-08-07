const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const { URL } = require('url');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 7171;

// Middleware
app.use(cors());
app.use(express.json());

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

// Handle preflight requests
app.options('*', (req, res) => {
  res.set(corsHeaders).status(204).send();
});

// Handle GET requests
app.get('/', (req, res) => {
  res.set({ 'Content-Type': 'text/plain', ...corsHeaders }).status(200)
    .send('Miko is on duty! The All-in-One Gemini Balance Worker is running perfectly.');
});

// Handle POST requests
app.post('*', (req, res) => {
  try {
    // Read API keys from environment variable
    const apiKeys = (process.env.GEMINI_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      return res.set(corsHeaders).status(500)
        .send('GEMINI_API_KEYS environment variable is not set or empty.');
    }

    // Randomly select a key for load balancing
    const selectedApiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    // Target API URL
    const googleApiUrl = 'https://generativelanguage.googleapis.com';
    const targetUrl = new URL(googleApiUrl + req.url);
    
    // Add selected key to query parameters
    targetUrl.searchParams.set('key', selectedApiKey);

    // Create options for the HTTPS request
    const options = {
      hostname: targetUrl.hostname,
      port: 443,
      path: targetUrl.pathname + targetUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Forward the request to Google's API
    const proxyReq = https.request(options, (proxyRes) => {
      // Set CORS headers for the response
      Object.keys(corsHeaders).forEach(key => res.set(key, corsHeaders[key]));
      
      // Set the status code from the upstream response
      res.status(proxyRes.statusCode);
      
      // Set headers from the upstream response (excluding hop-by-hop headers)
      Object.keys(proxyRes.headers).forEach(key => {
        if (!['connection', 'transfer-encoding'].includes(key.toLowerCase())) {
          res.set(key, proxyRes.headers[key]);
        }
      });
      
      // Pipe the response from Google API to our response
      proxyRes.pipe(res);
    });

    // Handle errors in the proxy request
    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      res.set(corsHeaders).status(500).send('Proxy request failed');
    });

    // Handle request body
    if (req.body) {
      proxyReq.write(JSON.stringify(req.body));
    }
    
    proxyReq.end();
  } catch (error) {
    console.error('Error processing request:', error);
    res.set(corsHeaders).status(500).send('Internal server error');
  }
});

// Handle all other methods
app.all('*', (req, res) => {
  res.set(corsHeaders).status(405).send('Method Not Allowed');
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gemini Load Balancer is running on port ${PORT}`);
});

// Add error handling for the server
server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('listening', () => {
  console.log(`Server is listening on port ${PORT}`);
});
