// src/pages/OptionsChain.js
// Options Chain — real-world style options chain with BS pricing

import React, { useState, useMemo } from 'react';
import { blackScholes, calcGreeks } from '../utils/blackscholes';

// ── Chain Generator ───────────────────────────────────────────────────────────

function generateChain(S0, T, r, sigma, q) {
  // Generate strikes around ATM
  const strikes = Array.from({ length: 21 }, (_, i) => 
    Math.round((S0 * 0.8 + i * S0 * 0.02))
  );

  return strikes.map(K => {
    const callPrice  = blackScholes(S0, K, T, r, sigma, q, 'call');
    const putPrice   = blackScholes(S0, K, T, r, sigma, q, 'put');
    const callGreeks = calcGreeks(S0, K, T, r, sigma, q, 'call');
    const putGreeks  = calcGreeks(S0, K, T, r, sigma, q, 'put');

    // Simulate bid/ask spread (wider for OTM options)
    const moneyness = Math.abs(Math.log(S0 / K));
    const spread = Math.max(0.01, callPrice * 0.02 + moneyness * 0.5);

    // Simulate open interest and volume (higher for ATM)
    const atmness = Math.exp(-5 * moneyness * moneyness);
    const callOI  = Math.round(atmness * 50000 + Math.random() * 5000);
    const putOI   = Math.round(atmness * 45000 + Math.random() * 5000);
    const callVol = Math.round(atmness * 10000 + Math.random() * 2000);
    const putVol  = Math.round(atmness * 9000  + Math.random() * 2000);

    // Moneyness classification
    const itm = S0 > K;

    return {
      K,
      call: {
        price:  callPrice,
        bid:    Math.max(0, callPrice - spread / 2),
        ask:    callPrice + spread / 2,
        iv:     sigma,
        delta:  callGreeks.delta,
        gamma:  callGreeks.gamma,
        theta:  callGreeks.theta,
        vega:   callGreeks.vega,
        oi:     callOI,
        volume: callVol,
        itm,
      },
      put: {
        price:  putPrice,
        bid:    Math.max(0, putPrice - spread / 2),
        ask:    putPrice + spread / 2,
        iv:     sigma,
        delta:  putGreeks.delta,
        gamma:  putGreeks.gamma,
        theta:  putGreeks.theta,
        vega:   putGreeks.vega,
        oi:     putOI,
        volume: putVol,
        itm:    !itm,
      },
    };
  });
}

// ── Format helpers ────────────────────────────────────────────────────────────

const fmt = (v, d = 2) => v.toFixed(d);
const fmtK = v => v.toLocaleString();

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OptionsChain() {
  const [S0,    setS0]    = useState(100);
  const [T,     setT]     = useState(0.25);
  const [r,     setR]     = useState(0.05);
  const [sigma, setSigma] = useState(0.20);
  const [q,     setQ]     = useState(0);
  const [view,  setView]  = useState('both'); // 'calls', 'puts', 'both'
  const [showGreeks, setShowGreeks] = useState(false);

  const chain = useMemo(() =>
    generateChain(S0, T, r, sigma, q),
    [S0, T, r, sigma, q]
  );

  const maturities = [
    { label: '1W',  value: 1/52  },
    { label: '1M',  value: 1/12  },
    { label: '3M',  value: 3/12  },
    { label: '6M',  value: 6/12  },
    { label: '1Y',  value: 1     },
    { label: '2Y',  value: 2     },
  ];

  const thStyle = {
    padding: '6px 8px',
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'right',
    background: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  };

  const tdStyle = (itm, align = 'right') => ({
    padding: '5px 8px',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    textAlign: align,
    background: itm ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
    borderBottom: '1px solid var(--border-light)',
    whiteSpace: 'nowrap',
  });

  const strikeStyle = {
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
    background: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border)',
    borderLeft: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>📋 Options Chain</h1>
        <p style={{ marginTop: 4 }}>
          Real-world style options chain — Black-Scholes pricing with Greeks and open interest.
        </p>
      </div>

      {/* Parameters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Parameters</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowGreeks(g => !g)}
              style={{
                padding: '4px 12px', fontSize: 11, fontWeight: 600,
                borderRadius: 4, border: '1px solid var(--border)',
                background: showGreeks ? 'var(--accent)' : 'transparent',
                color: showGreeks ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {showGreeks ? 'Hide Greeks' : 'Show Greeks'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 16 }}>
          {[
            { label: 'Spot (S₀)', value: S0,    set: setS0,    step: 1,     min: 10  },
            { label: 'Rate (r)',  value: r,     set: setR,     step: 0.005, min: 0   },
            { label: 'Vol (σ)',   value: sigma, set: setSigma, step: 0.01,  min: 0.01},
            { label: 'Div (q)',   value: q,     set: setQ,     step: 0.005, min: 0   },
          ].map(p => (
            <div key={p.label} className="input-group">
              <label className="input-label">{p.label}</label>
              <input type="number" className="input-field"
                value={p.value} step={p.step} min={p.min}
                onChange={e => p.set(parseFloat(e.target.value))} />
            </div>
          ))}
        </div>

        {/* Maturity selector */}
        <div style={{ marginBottom: 12 }}>
          <div className="input-label" style={{ marginBottom: 6 }}>Expiry</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {maturities.map(m => (
              <button key={m.label}
                onClick={() => setT(m.value)}
                style={{
                  padding: '4px 12px', fontSize: 12, fontWeight: 600,
                  borderRadius: 4,
                  border: `1px solid ${Math.abs(T - m.value) < 0.001 ? 'var(--accent)' : 'var(--border)'}`,
                  background: Math.abs(T - m.value) < 0.001 ? 'var(--accent-light)' : 'transparent',
                  color: Math.abs(T - m.value) < 0.001 ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* View selector */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['calls', 'both', 'puts'].map(v => (
            <button key={v}
              onClick={() => setView(v)}
              style={{
                padding: '4px 12px', fontSize: 11, fontWeight: 600,
                borderRadius: 4, textTransform: 'capitalize',
                border: `1px solid ${view === v ? 'var(--accent)' : 'var(--border)'}`,
                background: view === v ? 'var(--accent)' : 'transparent',
                color: view === v ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Chain Table */}
      <div className="card" style={{ marginBottom: 16, overflow: 'auto' }}>
        <div className="card-header">
          <span className="card-title">
            Options Chain — S₀ = {S0} · T = {Math.round(T * 12)}M · σ = {(sigma * 100).toFixed(0)}%
          </span>
          <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
            <span style={{ color: 'var(--accent)' }}>■ ITM</span>
            <span style={{ color: 'var(--text-muted)' }}>□ OTM</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {/* Calls header */}
              {(view === 'calls' || view === 'both') && (
                <>
                  {showGreeks && <>
                    <th style={{ ...thStyle, color: '#2563eb' }}>Vega</th>
                    <th style={{ ...thStyle, color: '#2563eb' }}>Theta</th>
                    <th style={{ ...thStyle, color: '#2563eb' }}>Gamma</th>
                    <th style={{ ...thStyle, color: '#2563eb' }}>Delta</th>
                  </>}
                  <th style={{ ...thStyle, color: '#2563eb' }}>OI</th>
                  <th style={{ ...thStyle, color: '#2563eb' }}>Vol</th>
                  <th style={{ ...thStyle, color: '#2563eb' }}>IV</th>
                  <th style={{ ...thStyle, color: '#2563eb' }}>Ask</th>
                  <th style={{ ...thStyle, color: '#2563eb' }}>Bid</th>
                  <th style={{ ...thStyle, color: '#2563eb', textAlign: 'center' }}>CALLS</th>
                </>
              )}

              {/* Strike */}
              <th style={{ ...thStyle, textAlign: 'center', minWidth: 70 }}>STRIKE</th>

              {/* Puts header */}
              {(view === 'puts' || view === 'both') && (
                <>
                  <th style={{ ...thStyle, color: '#dc2626', textAlign: 'left' }}>PUTS</th>
                  <th style={{ ...thStyle, color: '#dc2626' }}>Bid</th>
                  <th style={{ ...thStyle, color: '#dc2626' }}>Ask</th>
                  <th style={{ ...thStyle, color: '#dc2626' }}>IV</th>
                  <th style={{ ...thStyle, color: '#dc2626' }}>Vol</th>
                  <th style={{ ...thStyle, color: '#dc2626' }}>OI</th>
                  {showGreeks && <>
                    <th style={{ ...thStyle, color: '#dc2626' }}>Delta</th>
                    <th style={{ ...thStyle, color: '#dc2626' }}>Gamma</th>
                    <th style={{ ...thStyle, color: '#dc2626' }}>Theta</th>
                    <th style={{ ...thStyle, color: '#dc2626' }}>Vega</th>
                  </>}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {chain.map(row => {
              const isATM = Math.abs(row.K - S0) < S0 * 0.01;
              return (
                <tr key={row.K} style={{
                  background: isATM ? 'rgba(37, 99, 235, 0.03)' : 'transparent',
                  outline: isATM ? '1px solid rgba(37, 99, 235, 0.15)' : 'none',
                }}>
                  {/* Calls */}
                  {(view === 'calls' || view === 'both') && (
                    <>
                      {showGreeks && <>
                        <td style={tdStyle(row.call.itm)}>{fmt(row.call.vega, 4)}</td>
                        <td style={tdStyle(row.call.itm)}>{fmt(row.call.theta, 4)}</td>
                        <td style={tdStyle(row.call.itm)}>{fmt(row.call.gamma, 4)}</td>
                        <td style={tdStyle(row.call.itm)}>{fmt(row.call.delta, 4)}</td>
                      </>}
                      <td style={tdStyle(row.call.itm)}>{fmtK(row.call.oi)}</td>
                      <td style={tdStyle(row.call.itm)}>{fmtK(row.call.volume)}</td>
                      <td style={tdStyle(row.call.itm)}>{(row.call.iv * 100).toFixed(1)}%</td>
                      <td style={tdStyle(row.call.itm)}>{fmt(row.call.ask)}</td>
                      <td style={tdStyle(row.call.itm)}>{fmt(row.call.bid)}</td>
                      <td style={{ ...tdStyle(row.call.itm), textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>
                        {fmt(row.call.price)}
                      </td>
                    </>
                  )}

                  {/* Strike */}
                  <td style={{
                    ...strikeStyle,
                    color: isATM ? 'var(--accent)' : 'var(--text-primary)',
                    fontSize: isATM ? 13 : 12,
                  }}>
                    {row.K}
                    {isATM && <span style={{ fontSize: 9, color: 'var(--accent)', display: 'block' }}>ATM</span>}
                  </td>

                  {/* Puts */}
                  {(view === 'puts' || view === 'both') && (
                    <>
                      <td style={{ ...tdStyle(row.put.itm), textAlign: 'left', fontWeight: 700, color: '#dc2626' }}>
                        {fmt(row.put.price)}
                      </td>
                      <td style={tdStyle(row.put.itm)}>{fmt(row.put.bid)}</td>
                      <td style={tdStyle(row.put.itm)}>{fmt(row.put.ask)}</td>
                      <td style={tdStyle(row.put.itm)}>{(row.put.iv * 100).toFixed(1)}%</td>
                      <td style={tdStyle(row.put.itm)}>{fmtK(row.put.volume)}</td>
                      <td style={tdStyle(row.put.itm)}>{fmtK(row.put.oi)}</td>
                      {showGreeks && <>
                        <td style={tdStyle(row.put.itm)}>{fmt(row.put.delta, 4)}</td>
                        <td style={tdStyle(row.put.itm)}>{fmt(row.put.gamma, 4)}</td>
                        <td style={tdStyle(row.put.itm)}>{fmt(row.put.theta, 4)}</td>
                        <td style={tdStyle(row.put.itm)}>{fmt(row.put.vega, 4)}</td>
                      </>}
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* How to read */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">How to Read an Options Chain</span>
        </div>
        <div className="grid-2" style={{ gap: 24 }}>
          <div>
            {[
              { label: 'Bid / Ask', desc: 'The price at which market makers buy (bid) and sell (ask) options. The spread is the market maker\'s profit. Wide spreads = illiquid options.' },
              { label: 'IV (Implied Vol)', desc: 'The volatility implied by the option price. If IV > your forecast of realized vol, options are expensive. If IV < forecast, they are cheap.' },
              { label: 'Volume', desc: 'Number of contracts traded today. High volume = active interest. Compare to open interest to see if new positions are being opened.' },
              { label: 'Open Interest (OI)', desc: 'Total number of outstanding contracts. High OI at a strike = significant market interest. Often acts as support/resistance for the underlying.' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--accent)', marginBottom: 3 }}>{item.label}</div>
                <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div>
            {[
              { label: 'ITM vs OTM (shading)', desc: 'Blue shading = In-the-Money. For calls, ITM means S > K. For puts, ITM means S < K. ITM options have intrinsic value; OTM options are pure time value.' },
              { label: 'ATM (center row)', desc: 'The strike closest to the current spot price. ATM options have the highest time value, highest gamma, and are the most liquid.' },
              { label: 'Delta', desc: 'Shows how many shares the option behaves like. A call with delta 0.6 moves $0.60 for every $1 move in the underlying. Also approximates probability of expiring ITM.' },
              { label: 'Theta', desc: 'Daily time decay in dollars. An option with theta -0.05 loses $0.05 per day. Sellers collect theta; buyers pay it.' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--accent)', marginBottom: 3 }}>{item.label}</div>
                <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="info-box" style={{ marginTop: 16, fontSize: 12 }}>
          <strong>📌 Note on data:</strong> This chain is generated using Black-Scholes with a flat 
          vol surface. In real markets, each strike would have a different IV (the vol smile/skew). 
          Open interest and volume are simulated to be representative of real market behavior 
          (higher near ATM, lower for deep OTM strikes). With a real market data API 
          (Bloomberg, Refinitiv, CBOE), this chain would show live market prices.
        </div>
      </div>

    </div>
  );
}