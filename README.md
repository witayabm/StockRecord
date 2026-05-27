# Stock Record

Stock Record is a small US stock buy/sell tracker with a separated frontend and backend.

## What It Does

- Stores buy and sell transactions in a local JSON file
- Calculates holdings, average cost, realized P/L, unrealized P/L, and portfolio summary
- Fetches market data from Financial Modeling Prep
- Shows a responsive dashboard for desktop and mobile

## Architecture

- `frontend/server.js` serves the static UI from `public/`
- `backend/server.js` exposes the API and business logic
- `server.js` starts both servers together for convenience
- Shared utilities live in `src/`

## Project Structure

```text
StockRecord/
  backend/
    server.js
  frontend/
    server.js
  public/
    index.html
    styles.css
    app.js
  src/
    env.js
    market.js
    portfolio.js
    storage.js
  data/
    transactions.json
  server.js
  package.json
  .env.example
  Dockerfile
  docker-compose.yml
  README.md
```

## Requirements

- Node.js 20 or newer
- Docker, if you want to run the containerized setup

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

```text
NODE_ENV=development
FRONTEND_PORT=3000
BACKEND_PORT=3001
API_BASE_URL=http://localhost:3001
FRONTEND_BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
FMP_API_KEY=
DATA_FILE=./data/transactions.json
```

## Install

```sh
npm install
```

## Run Locally

Start both servers:

```sh
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

Start them separately if you want to work on only one side:

```sh
npm run start:frontend
npm run start:backend
```

Development mode with auto-reload:

```sh
npm run dev
```

## Docker

```sh
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## Deploy On Separate Domains

If you host the frontend and backend on different domains, set these values in the environment:

```text
API_BASE_URL=https://api.example.com
FRONTEND_BASE_URL=https://app.example.com
CORS_ORIGIN=https://app.example.com
```

- `API_BASE_URL` is what the browser uses to call the backend from `public/app.js`
- `CORS_ORIGIN` must match the exact frontend origin, or be a comma-separated list of allowed origins
- `FRONTEND_BASE_URL` is used by `frontend/server.js` when it serves `config.js`

If you use Docker Compose, update the `.env` file and make sure the container environment is not overriding those values back to `localhost`.

## API Endpoints

- `GET /health`
- `GET /api/dashboard`
- `GET /api/transactions`
- `POST /api/transactions`
- `DELETE /api/transactions/:id`
- `GET /api/fmp/profile?symbol=AAPL`
- `GET /api/fmp/historical-price-eod?symbol=AAPL&limit=20`
- `GET /api/stocks/lookup?query=Apple`

## Transaction Payload

`POST /api/transactions`

```json
{
  "asset": "AAPL",
  "type": "buy",
  "shares": 10,
  "totalAmount": 1500,
  "date": "2026-05-26",
  "note": "Long term entry"
}
```

## Notes

- The frontend talks to the backend through `API_BASE_URL` from `config.js`
- If you change the ports, update `.env` accordingly
- `data/transactions.json` is created automatically if it does not exist
