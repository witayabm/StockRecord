# Stock Record

เว็บสำหรับบันทึกซื้อ/ขายหุ้นอเมริกา พร้อม frontend, backend, dashboard และราคาล่าสุดจาก API ที่ backend มีอยู่แล้ว

## What it does

- บันทึกรายการซื้อและขายหุ้น
- คำนวณ current holdings, average cost, realized P/L, unrealized P/L
- ดึงราคาล่าสุดของหุ้นผ่าน `Financial Modeling Prep` และ fallback ไป `Yahoo Finance`
- แสดง dashboard แบบ responsive ใช้งานได้ทั้ง desktop และ mobile
- เก็บข้อมูล transaction ลงไฟล์ JSON ในเครื่อง

## Tech Stack

- Node.js 20
- Native `http` server
- Vanilla HTML / CSS / JavaScript
- File-based storage
- Docker

## Project Structure

```text
StockRecord/
  public/
    index.html
    styles.css
    app.js
  src/
    env.js
    market.js
    portfolio.js
    server.js
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

## Environment Variables

Create `.env` from `.env.example`

```text
NODE_ENV=development
PORT=3000
BACKEND_PORT=3001
API_BASE_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
FMP_API_KEY=
DATA_FILE=./data/transactions.json
```

## Install

```sh
npm install
```

> The project uses only built-in Node modules, so `npm install` mainly creates the lockfile and prepares the workflow.

## Run Locally

```sh
npm start
```

Open:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

For development with auto-restart:

```sh
npm run dev
```

## Run With Docker

```sh
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## Important API Endpoints

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

## How Dashboard Works

- `summary` card reads from all transactions
- `holdings` table shows only open positions
- `latestPrice` is fetched per symbol from the backend API
- if FMP fails, the backend uses Yahoo Finance fallback

## Troubleshooting

- If stock data is empty, check `FMP_API_KEY` in `.env`
- If frontend cannot reach backend, confirm ports `3000` and `3001` are free
- If Docker build fails, make sure Docker Engine is running
- If deleting a transaction is rejected, it usually means the remaining history would make the portfolio invalid
