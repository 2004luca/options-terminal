// src/pages/StrategyPlayground.js
// Options Strategy Playground — P&L diagrams for common strategies

import React, { useState, useMemo } from 'react';
import { blackScholes } from '../utils/blackscholes';

// ── Strategy Definitions ─────────────────────────────────────────────────────

const STRATEGIES = {
  'Long Call': {
    desc: 'Buy a call option. Bullish view — profit if spot rises above K + premium paid.',
    when: 'Use when you are bullish and expect a significant upward move. Best when implied vol is low — you buy cheap options that benefit if realized vol exceeds implied.',
    legs: (K1) => [{ type: 'call', K: K1, qty: 1 }],
    params: ['K1'],
  },
  'Long Put': {
    desc: 'Buy a put option. Bearish view — profit if spot falls below K - premium paid.',
    when: 'Use when you are bearish or want portfolio protection. Also used as a hedge against long equity positions. Best when implied vol is low.',
    legs: (K1) => [{ type: 'put', K: K1, qty: 1 }],
    params: ['K1'],
  },
  'Short Call': {
    desc: 'Sell a call option. Collect premium. Profit if spot stays below K. Unlimited risk if spot rises.',
    when: 'Use when neutral to mildly bearish. Common as covered call — selling calls against long stock position to generate income. Dangerous naked (without stock).',
    legs: (K1) => [{ type: 'call', K: K1, qty: -1 }],
    params: ['K1'],
  },
  'Short Put': {
    desc: 'Sell a put option. Collect premium. Profit if spot stays above K.',
    when: 'Use when neutral to mildly bullish. Effectively agreeing to buy the stock at K if it falls. Warren Buffett famously uses this to enter stock positions at desired prices.',
    legs: (K1) => [{ type: 'put', K: K1, qty: -1 }],
    params: ['K1'],
  },
  'Bull Call Spread': {
    desc: 'Buy low strike call, sell high strike call. Bullish but capped upside. Cheaper than Long Call.',
    when: 'Use when moderately bullish. The short call reduces cost but caps upside at K2. Best when implied vol is high — the short call benefits more from vol compression.',
    legs: (K1, K2) => [
      { type: 'call', K: K1, qty:  1 },
      { type: 'call', K: K2, qty: -1 },
    ],
    params: ['K1', 'K2'],
  },
  'Bear Put Spread': {
    desc: 'Buy high strike put, sell low strike put. Bearish but capped downside. Cheaper than Long Put.',
    when: 'Use when moderately bearish. Cheaper than a long put but profit is capped at K2-K1. Good risk/reward for defined bearish scenarios.',
    legs: (K1, K2) => [
      { type: 'put', K: K2, qty:  1 },
      { type: 'put', K: K1, qty: -1 },
    ],
    params: ['K1', 'K2'],
  },
  'Straddle': {
    desc: 'Buy a call and put at the same strike. Profit from large moves in either direction.',
    when: 'Use before major events (earnings, Fed meetings, elections) when you expect a big move but are unsure of direction. You are long volatility — profit if realized vol > implied vol.',
    legs: (K1) => [
      { type: 'call', K: K1, qty: 1 },
      { type: 'put',  K: K1, qty: 1 },
    ],
    params: ['K1'],
  },
  'Strangle': {
    desc: 'Buy OTM call and OTM put. Cheaper than straddle but needs larger move to profit.',
    when: 'Use when expecting a very large move but want to pay less than a straddle. The OTM strikes make it cheaper but require a bigger move to profit.',
    legs: (K1, K2) => [
      { type: 'put',  K: K1, qty: 1 },
      { type: 'call', K: K2, qty: 1 },
    ],
    params: ['K1', 'K2'],
  },
  'Iron Condor': {
    desc: 'Sell OTM put spread + sell OTM call spread. Profit if spot stays in a range.',
    when: 'Use when expecting low volatility and range-bound market. You collect premium and profit if spot stays between K2 and K3. Popular in low-vol environments.',
    legs: (K1, K2, K3, K4) => [
      { type: 'put',  K: K1, qty: -1 },
      { type: 'put',  K: K2, qty:  1 },
      { type: 'call', K: K3, qty:  1 },
      { type: 'call', K: K4, qty: -1 },
    ],
    params: ['K1', 'K2', 'K3', 'K4'],
  },
  'Butterfly': {
    desc: 'Buy low call, sell 2 mid calls, buy high call. Profit if spot is near middle strike at expiry.',
    when: 'Use when you have a very specific price target at expiry. Low cost, defined risk. Maximum profit at K2 at expiry. Popular when implied vol is high.',
    legs: (K1, K2, K3) => [
      { type: 'call', K: K1, qty:  1 },
      { type: 'call', K: K2, qty: -2 },
      { type: 'call', K: K3, qty:  1 },
    ],
    params: ['K1', 'K2', 'K3'],
  },
};

// ── P&L Calculator ────────────────────────────────────────────────────────────

function calcPnL(legs, spots, T, r, sigma, q) {
  // Cost of entering the position (negative = credit received)
  const cost = legs.reduce((sum, leg) => {
    return sum + leg.qty * blackScholes(spots[Math.floor(spots.length / 2)], leg.K, T, r, sigma, q, leg.type);
  }, 0);

  // P&L at expiry (T=0) for each spot
  const pnlExpiry = spots.map(S => {
    const payoff = legs.reduce((sum, leg) => {
      const intrinsic = leg.type === 'call'
        ? Math.max(S - leg.K, 0)
        : Math.max(leg.K - S, 0);
      return sum + leg.qty * intrinsic;
    }, 0);
    return payoff - cost;
  });

  // P&L today (theoretical, using BS) for each spot
  const pnlToday = spots.map(S => {
    const value = legs.reduce((sum, leg) => {
      return sum + leg.qty * blackScholes(S, leg.K, T, r, sigma, q, leg.type);
    }, 0);
    return value - cost;
  });

  return { pnlExpiry, pnlToday, cost };
}

// ── P&L Chart (SVG) ───────────────────────────────────────────────────────────

function PnLChart({ spots, pnlExpiry, pnlToday, strikes }) {
  const width  = 680;
  const height = 300;
  const padL = 55, padR = 20, padT = 50, padB = 35;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const xMin = Math.min(...spots);
  const xMax = Math.max(...spots);
  const allY  = [...pnlExpiry, ...pnlToday];
  const yMin  = Math.min(...allY, 0);
  const yMax  = Math.max(...allY, 0);
  const yPad  = (yMax - yMin) * 0.1 || 1;

  const toX = x => padL + (x - xMin) / (xMax - xMin) * chartW;
  const toY = y => padT + chartH - (y - (yMin - yPad)) / ((yMax + yPad) - (yMin - yPad)) * chartH;

  const pathExpiry = spots.map((x, i) =>
    `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(1)} ${toY(pnlExpiry[i]).toFixed(1)}`
  ).join(' ');

  const pathToday = spots.map((x, i) =>
    `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(1)} ${toY(pnlToday[i]).toFixed(1)}`
  ).join(' ');

  const zeroY = toY(0);
  const yTicks = [yMin, 0, yMax].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke="#2563eb" strokeWidth="2"/></svg>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>P&L @ Expiry</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6,3"/></svg>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>P&L Today (Theoretical)</span>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Grid */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={padL} y1={toY(tick)} x2={width - padR} y2={toY(tick)}
              stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4,4" />
            <text x={padL - 6} y={toY(tick) + 4}
              textAnchor="end" fontSize="10" fill="var(--text-muted)">
              {tick.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Zero line */}
        <line x1={padL} y1={zeroY} x2={width - padR} y2={zeroY}
          stroke="var(--border)" strokeWidth="1" />

        {/* X axis labels */}
        {[xMin, (xMin + xMax) / 2, xMax].map((x, i) => (
          <text key={i} x={toX(x)} y={height - 8}
            textAnchor="middle" fontSize="10" fill="var(--text-muted)">
            {x.toFixed(0)}
          </text>
        ))}

        {/* Strike lines */}
        {strikes.map((K, i) => (
          <g key={i}>
            <line x1={toX(K)} y1={padT} x2={toX(K)} y2={height - padB}
              stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
            <text x={toX(K)} y={i % 2 === 0 ? padT - 4 : padT + 8}
              textAnchor="middle" fontSize="9" fill="#94a3b8">
              K{i + 1}={K}
            </text>
          </g>
        ))}

        {/* P&L Today line */}
        <path d={pathToday} fill="none"
          stroke="#f97316" strokeWidth="1.5" strokeDasharray="6,3" />

        {/* P&L Expiry line */}
        <path d={pathExpiry} fill="none"
          stroke="#2563eb" strokeWidth="2" />
      </svg>
    </div>
  );
}

// ── Metrics Bar ───────────────────────────────────────────────────────────────

function MetricsBar({ legs, spots, pnlExpiry, cost, S0 }) {
  const maxProfit = Math.max(...pnlExpiry);
  const maxLoss   = Math.min(...pnlExpiry);

  const breakevens = [];
  for (let i = 1; i < pnlExpiry.length; i++) {
    if ((pnlExpiry[i - 1] < 0 && pnlExpiry[i] >= 0) ||
        (pnlExpiry[i - 1] >= 0 && pnlExpiry[i] < 0)) {
      const x = spots[i - 1] + (spots[i] - spots[i - 1]) *
        (-pnlExpiry[i - 1]) / (pnlExpiry[i] - pnlExpiry[i - 1]);
      breakevens.push(x.toFixed(1));
    }
  }

  const metrics = [
    { label: 'Net Cost',    value: cost >= 0 ? `${cost.toFixed(2)} Dr` : `${Math.abs(cost).toFixed(2)} Cr` },
    { label: 'Max Profit',  value: maxProfit > 1000 ? '∞' : maxProfit.toFixed(2), positive: true },
    { label: 'Max Loss',    value: maxLoss < -1000  ? '∞' : Math.abs(maxLoss).toFixed(2), negative: true },
    { label: 'Breakeven(s)', value: breakevens.length > 0 ? breakevens.join(', ') : 'N/A' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
      {metrics.map(m => (
        <div key={m.label} style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '10px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            {m.label}
          </div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: m.positive ? 'var(--green)' : m.negative ? 'var(--red)' : 'var(--text-primary)'
          }}>
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StrategyPlayground() {
  const S0 = 100;

  const [strategy, setStrategy] = useState('Long Call');
  const [T,     setT]     = useState(0.5);
  const [r,     setR]     = useState(0.03);
  const [sigma, setSigma] = useState(0.2);
  const [K1,    setK1]    = useState(100);
  const [K2,    setK2]    = useState(110);
  const [K3,    setK3]    = useState(120);
  const [K4,    setK4]    = useState(130);

  const strat = STRATEGIES[strategy];
  const legs  = strat.legs(K1, K2, K3, K4);

  const spots = useMemo(() =>
    Array.from({ length: 200 }, (_, i) => i + 1),
    []
  );

  const { pnlExpiry, pnlToday, cost } = useMemo(() =>
    calcPnL(legs, spots, T, r, sigma, 0),
    [legs, spots, T, r, sigma]
  );

  const strikes = strat.params.map((p, i) => [K1, K2, K3, K4][i]);

  const sliderStyle = {
    width: '100%',
    accentColor: 'var(--accent)',
    margin: '4px 0 12px',
  };

return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>Strategy Playground</h1>
        <p style={{ marginTop: 4 }}>
          Black-Scholes P&L analysis for common options strategies. S₀ = {S0}
        </p>
      </div>

      {/* Strategy selector */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Strategy</span>
        </div>
        <select
          className="select-field"
          style={{ width: '100%', marginBottom: 10 }}
          value={strategy}
          onChange={e => setStrategy(e.target.value)}
        >
          {Object.keys(STRATEGIES).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="info-box" style={{ margin: 0 }}>{strat.desc}</div>
      </div>

      {/* Parameters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Parameters</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Underlying S₀ = {S0}</span>
        </div>

        <div className="grid-2">
          <div>
            {strat.params.includes('K1') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="input-label">Strike K1</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{K1}</span>
                </div>
                <input type="range" min={50} max={150} value={K1}
                  onChange={e => setK1(Number(e.target.value))} style={sliderStyle} />
              </div>
            )}
            {strat.params.includes('K2') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="input-label">Strike K2</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{K2}</span>
                </div>
                <input type="range" min={50} max={150} value={K2}
                  onChange={e => setK2(Number(e.target.value))} style={sliderStyle} />
              </div>
            )}
            {strat.params.includes('K3') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="input-label">Strike K3</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{K3}</span>
                </div>
                <input type="range" min={50} max={150} value={K3}
                  onChange={e => setK3(Number(e.target.value))} style={sliderStyle} />
              </div>
            )}
            {strat.params.includes('K4') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="input-label">Strike K4</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{K4}</span>
                </div>
                <input type="range" min={50} max={150} value={K4}
                  onChange={e => setK4(Number(e.target.value))} style={sliderStyle} />
              </div>
            )}
          </div>

          <div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="input-label">Maturity (Years)</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{T}</span>
              </div>
              <input type="range" min={0.1} max={2} step={0.1} value={T}
                onChange={e => setT(Number(e.target.value))} style={sliderStyle} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="input-label">Implied Volatility</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{(sigma * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min={0.05} max={0.8} step={0.01} value={sigma}
                onChange={e => setSigma(Number(e.target.value))} style={sliderStyle} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="input-label">Risk-Free Rate</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{(r * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min={0} max={0.1} step={0.005} value={r}
                onChange={e => setR(Number(e.target.value))} style={sliderStyle} />
            </div>
          </div>
        </div>
      </div>

      {/* P&L Chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">P&L Analysis</span>
        </div>
        <PnLChart
          spots={spots}
          pnlExpiry={pnlExpiry}
          pnlToday={pnlToday}
          strikes={strikes}
        />
        <MetricsBar
          legs={legs}
          spots={spots}
          pnlExpiry={pnlExpiry}
          cost={cost}
          S0={S0}
        />
      </div>

      {/* Strategy Guide */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Strategy Guide — {strategy}</span>
        </div>

        <div className="grid-2" style={{ gap: 24 }}>
          {/* When to use */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--text-primary)' }}>
              When to Use
            </div>
            <div className="info-box" style={{ margin: 0, fontSize: 13 }}>
              {strat.when}
            </div>
          </div>

          {/* Risk Profile */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--text-primary)' }}>
               Risk Profile
            </div>
            {(() => {
              const maxProfit  = Math.max(...pnlExpiry);
              const maxLoss    = Math.min(...pnlExpiry);
              const riskReward = maxLoss !== 0 ? Math.abs(maxProfit / maxLoss).toFixed(2) : '∞';
              return (
                <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                  {[
                    { label: 'Max Profit',   value: maxProfit > 1000 ? '∞' : maxProfit.toFixed(2), color: 'var(--green)' },
                    { label: 'Max Loss',     value: maxLoss < -1000  ? '∞' : Math.abs(maxLoss).toFixed(2), color: 'var(--red)' },
                    { label: 'Risk/Reward',  value: riskReward, color: 'var(--text-primary)' },
                    { label: 'Net Cost',     value: cost >= 0 ? `${cost.toFixed(2)} Dr` : `${Math.abs(cost).toFixed(2)} Cr`, color: 'var(--text-primary)' },
                  ].map((item, i, arr) => (
                    <div key={item.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none',
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: item.color }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
{/* How to read the chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">How to Read This Chart</span>
        </div>

        <div className="grid-2" style={{ gap: 24 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: '#2563eb' }}>——</span> P&L @ Expiry
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              Shows the profit or loss of the strategy <strong>at expiration</strong>, 
              for each possible spot price. This is the "true" payoff — 
              the exact outcome if you hold the position until expiry.
              Options behave like their payoff diagrams only at expiration.
            </p>
            <div className="info-box" style={{ marginTop: 8, fontSize: 12 }}>
              <strong>Example:</strong> A Long Call at K=100 expires worthless if spot &lt; 100, 
              and gains $1 for every $1 the spot moves above 100 (minus the premium paid).
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: '#f97316' }}>- - -</span> P&L Today (Theoretical)
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              Shows the <strong>current theoretical value</strong> of the position 
              using Black-Scholes, before expiry. This line is smoother and curved 
              because options still have <strong>time value</strong> — 
              even OTM options have some probability of expiring ITM.
            </p>
            <div className="info-box" style={{ marginTop: 8, fontSize: 12 }}>
              <strong>Key insight:</strong> The gap between the two lines represents 
              the <strong>time value</strong> of the options. As expiry approaches, 
              the "Today" line converges toward the "Expiry" line — this is theta decay in action.
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>📐 How to Use This Chart</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { title: 'Breakeven',    desc: 'The spot price where P&L crosses zero at expiry. Below this (for debit strategies) you lose money.' },
              { title: 'Max Profit',   desc: 'The highest possible gain. For spreads and condors this is capped. For long options it can be unlimited.' },
              { title: 'Max Loss',     desc: 'The worst case scenario. For debit strategies it is the premium paid. For credit strategies it can be larger.' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '10px 12px',
              }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}