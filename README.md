# Gemini Load Balancer (Local Alternative)

This is a local alternative to the Cloudflare Worker implementation that provides load balancing for Gemini API requests. It randomly selects an API key from the provided list for each request to distribute the load.

## Features

- Load balancing across multiple Gemini API keys
- CORS support for cross-origin requests
- Docker support for easy deployment
- Environment-based configuration

## Prerequisites

- Node.js (version 14 or higher)
- Docker (optional, for containerized deployment)
- Gemini API keys

## Setup

1. Clone this repository or copy the files to your local machine.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your Gemini API keys:
   ```env
   GEMINI_API_KEYS=your_api_key_1,your_api_key_2,your_api_key_3
   ```

## Usage

### Local Development

1. Start the server:
   ```bash
   npm start
   ```

2. The server will be available at `http://localhost:7171`

### Using Docker

1. Build and start the container:
   ```bash
   docker-compose up --build
   ```

2. The server will be available at `http://localhost:7171`

## API Endpoints

- `GET /` - Health check endpoint
- `POST /*` - Forward requests to Gemini API with load balancing

## How It Works

1. The server reads the `GEMINI_API_KEYS` environment variable, which should contain a comma-separated list of your Gemini API keys.

2. For each incoming POST request, the server:
   - Randomly selects one API key from the list
   - Forwards the request to the Gemini API using the selected key
   - Returns the response from the Gemini API

This approach distributes the requests across your API keys, helping to avoid rate limits.