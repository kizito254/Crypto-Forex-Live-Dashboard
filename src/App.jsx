import { useMemo, useState } from 'react';
import { useMarketStream } from './useMarketStream';

const CRYPTO_PAIRS = [
  { symbol: 'btcusdt', label: 'BTC / USDT' },
  { symbol: 'ethusdt', label: 'ETH / USDT' },
  { symbol: 'solusdt', label: 'SOL / USDT' },
  { symbol: 'xrpusdt', label: 'XRP / USDT' },
];

const FOREX_PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}

function formatTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString();
}

function PanelHeader({ icon, title, alt }) {
  return (
    <div className="panel-header">
      <img src={icon} alt={alt} className="panel-icon" />
      <h2>{title}</h2>
    </div>
  );
}

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_PAIRS[0].symbol);
  const crypto = useMarketStream({ type: 'crypto', symbol: selectedCrypto });
  const forex = useMarketStream({ type: 'forex', symbol: FOREX_PAIRS.join(',') });

  const forexRows = useMemo(() => {
    return FOREX_PAIRS.map((symbol) => {
      const item = forex.multiPrices[symbol];
      return {
        symbol,
        price: item?.price,
        changePct: item?.changePct,
        lastUpdate: item?.lastUpdate,
      };
    });
  }, [forex.multiPrices]);

  return (
    <main className="container">
      <header>
        <h1>Crypto & Forex Live Dashboard</h1>
        <p className="subtitle">React + WebSocket market tracker with live updates</p>
        <img src="/market-hero.svg" alt="Market dashboard overview" className="hero-image" />
      </header>

      <section className="grid">
        <article className="panel">
          <PanelHeader icon="/crypto-icon.svg" title="Crypto Ticker" alt="Crypto icon" />
          <div className="tabs">
            {CRYPTO_PAIRS.map((pair) => (
              <button
                key={pair.symbol}
                className={pair.symbol === selectedCrypto ? 'active' : ''}
                onClick={() => setSelectedCrypto(pair.symbol)}
              >
                {pair.label}
              </button>
            ))}
          </div>

          <div className="stat-row">
            <span>Connection:</span>
            <strong className={crypto.status === 'connected' ? 'ok' : 'warn'}>{crypto.status}</strong>
          </div>
          <div className="stat-row">
            <span>Last Price:</span>
            <strong>{crypto.price ? `$${formatPrice(crypto.price)}` : '-'}</strong>
          </div>
          <div className="stat-row">
            <span>24h Change:</span>
            <strong className={crypto.changePct >= 0 ? 'ok' : 'down'}>
              {Number.isFinite(crypto.changePct) ? `${crypto.changePct.toFixed(2)}%` : '-'}
            </strong>
          </div>
          <div className="stat-row">
            <span>Updated:</span>
            <strong>{formatTime(crypto.lastUpdate)}</strong>
          </div>
        </article>

        <article className="panel">
          <PanelHeader icon="/forex-icon.svg" title="Forex Quotes" alt="Forex icon" />
          <div className="stat-row">
            <span>Connection:</span>
            <strong className={forex.status === 'connected' ? 'ok' : 'warn'}>{forex.status}</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>Pair</th>
                <th>Price</th>
                <th>Change</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {forexRows.map((row) => (
                <tr key={row.symbol}>
                  <td>{row.symbol}</td>
                  <td>{row.price ? formatPrice(row.price) : '-'}</td>
                  <td className={row.changePct >= 0 ? 'ok' : 'down'}>
                    {Number.isFinite(row.changePct) ? `${row.changePct.toFixed(3)}%` : '-'}
                  </td>
                  <td>{formatTime(row.lastUpdate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {forex.error && <p className="error">{forex.error}</p>}
        </article>
      </section>

      <footer>
        <small>
          Crypto: Binance public stream. Forex: EODHD demo stream with simulation fallback if unavailable.
        </small>
      </footer>
    </main>
  );
}

export default App;
