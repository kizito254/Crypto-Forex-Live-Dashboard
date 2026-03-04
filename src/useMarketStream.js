import { useEffect, useRef, useState } from 'react';

const FOREX_BASELINE = {
  EURUSD: 1.08,
  GBPUSD: 1.27,
  USDJPY: 151.0,
  AUDUSD: 0.66,
};

function randomStep(current, drift = 0.001) {
  const move = (Math.random() - 0.5) * drift;
  return Math.max(0.0001, current * (1 + move));
}

export function useMarketStream({ type, symbol }) {
  const [state, setState] = useState({
    status: 'connecting',
    price: null,
    changePct: null,
    lastUpdate: null,
    multiPrices: {},
    error: '',
  });
  const reconnectRef = useRef(null);

  useEffect(() => {
    let ws;
    let simulationInterval;
    let cancelled = false;

    function setPartial(next) {
      if (!cancelled) {
        setState((prev) => ({ ...prev, ...next }));
      }
    }

    function startForexSimulation() {
      setPartial({
        status: 'simulated',
        error: 'Live forex stream unavailable; running simulated stream.',
      });

      const prices = { ...FOREX_BASELINE };
      simulationInterval = setInterval(() => {
        const updates = {};
        Object.keys(prices).forEach((pair) => {
          const previous = prices[pair];
          const next = randomStep(previous, 0.0022);
          prices[pair] = next;
          updates[pair] = {
            price: next,
            changePct: ((next - previous) / previous) * 100,
            lastUpdate: Date.now(),
          };
        });
        setPartial({ multiPrices: updates });
      }, 1200);
    }

    function connect() {
      setPartial({ status: 'connecting', error: '' });

      if (type === 'crypto') {
        const stream = `wss://stream.binance.com:9443/ws/${symbol}@ticker`;
        ws = new WebSocket(stream);
        ws.onopen = () => setPartial({ status: 'connected' });
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setPartial({
            price: Number(data.c),
            changePct: Number(data.P),
            lastUpdate: data.E,
          });
        };
      } else {
        // Demo endpoint, may be rate-limited/offline.
        ws = new WebSocket('wss://ws.eodhistoricaldata.com/ws/forex?api_token=demo');
        ws.onopen = () => {
          setPartial({ status: 'connected' });
          ws.send(JSON.stringify({ action: 'subscribe', symbols: symbol }));
        };
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (!data || !data.s || !Number.isFinite(Number(data.p))) return;
          setState((prev) => {
            const previous = prev.multiPrices[data.s]?.price ?? Number(data.p);
            const current = Number(data.p);
            return {
              ...prev,
              multiPrices: {
                ...prev.multiPrices,
                [data.s]: {
                  price: current,
                  changePct: ((current - previous) / previous) * 100,
                  lastUpdate: Date.now(),
                },
              },
            };
          });
        };
      }

      ws.onerror = () => {
        setPartial({ status: 'error' });
      };

      ws.onclose = () => {
        if (cancelled) return;
        if (type === 'forex') {
          startForexSimulation();
          return;
        }
        reconnectRef.current = setTimeout(connect, 2200);
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectRef.current);
      clearInterval(simulationInterval);
      if (ws && ws.readyState < 2) {
        ws.close();
      }
    };
  }, [type, symbol]);

  return state;
}
