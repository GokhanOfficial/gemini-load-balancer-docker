# Gemini Load Balancer (Local Alternative)

This is a local alternative to the Cloudflare Worker that provides load balancing for Gemini API keys. It randomly selects an API key from the configured list for each request, distributing the load across multiple keys.

## Features

- Load balancing across multiple Gemini API keys
- CORS support
- Docker containerization
- Environment-based configuration
- Random key selection for each request

## Prerequisites

- Docker and Docker Compose
- Gemini API keys

## Setup

1. Clone or download this repository
2. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit the `.env` file and add your actual Gemini API keys:
   ```env
   GEMINI_API_KEYS=your_actual_api_key_1,your_actual_api_key_2,your_actual_api_key_3
   ```

## Usage

### Running with Docker Compose (Recommended)

To start the service:

```bash
docker-compose up -d
```

The service will be available at `http://localhost:7171`

To stop the service:

```bash
docker-compose down
```

### Development Mode

For development with live reloading:

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

## API Endpoints

- `GET /` - Health check endpoint that returns a status message
- `POST /*` - Forwards requests to the Gemini API using a randomly selected key
- `OPTIONS /*` - Handles CORS preflight requests

## How It Works

1. When a POST request is received, the service reads the `GEMINI_API_KEYS` from the environment
2. It randomly selects one key from the list
3. It forwards the request to the Gemini API (`https://generativelanguage.googleapis.com`) with the selected key
4. The response from Gemini API is returned to the client with appropriate CORS headers

## Configuration

All configuration is done through environment variables in the `.env` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEYS` | Comma-separated list of Gemini API keys | `key1,key2,key3` |

## License

MIT
