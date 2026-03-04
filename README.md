# Crypto & Forex Live Dashboard

A React-based live market dashboard that streams:

- **Crypto** prices from Binance public WebSocket streams.
- **Forex** prices from EODHD demo WebSocket (with automatic local simulation fallback when unavailable).

## Features

- Live crypto ticker with pair switching (BTC, ETH, SOL, XRP).
- Visual hero banner plus dedicated crypto/forex icons.
- Live forex table for EURUSD, GBPUSD, USDJPY, AUDUSD.
- Connection status for each feed.
- Auto-reconnect behavior for crypto stream.
- Graceful forex simulation fallback if live stream is blocked.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
