// src/pages/OptionsPricer.js
// Options Pricer — Black-Scholes + Greeks + PDE comparison

import React, { useState, useMemo } from 'react';
import { blackScholes, calcGreeks } from '../utils/blackscholes';

// ── Input Panel ──────────────────────────────────────────────────────────────

function InputPanel({ params, onChange }) {
  const fields = [
    { key: 'S',     label: 'Spot (S₀)',       step: 1   },
    { key: 'K',     label: 'Strike (K)',       step: 1   },
    { key: 'T',     label: 'Maturity (T, yrs)', step: 0.1 },
    { key: 'r',     label: 'Rate (r)',         step: 0.001 },
    { key: 'sigma', label: 'Vol (σ)',          step: 0.01 },
    { key: 'q',     label: 'Dividend (q)',     step: 0.001 },
  ];

  return (
    <div className="panel-left">
      <div style={{ marginBottom: 20 }}>
        <h2>Parameters</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Adjust inputs to update pricing
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="input-label" style={{ marginBottom: 6 }}>Option Type</div>
        <select
          className="select-field"
          style={{ width: '100%' }}
          value={params.type}
          onChange={e => onChange('type', e.target.value)}
        >
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </div>

      {fields.map(f => (
        <div className="input-group" key={f.key}>
          <label className="input-label">{f.label}</label>
          <input
            type="number"
            className="input-field"
            value={params[f.key]}
            step={f.step}
            onChange={e => onChange(f.key, parseFloat(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
}

// ── Greeks Display ───────────────────────────────────────────────────────────

function GreeksPanel({ greeks, price }) {
  const items = [
    { label: 'Price',  value: price.toFixed(4),          sub: 'Option value',           color: 'var(--accent)' },
    { label: 'Delta',  value: greeks.delta.toFixed(4),   sub: '∂V/∂S',                  color: null },
    { label: 'Gamma',  value: greeks.gamma.toFixed(4),   sub: '∂²V/∂S²',               color: null },
    { label: 'Vega',   value: greeks.vega.toFixed(4),    sub: '∂V/∂σ per 1%',          color: null },
    { label: 'Theta',  value: greeks.theta.toFixed(4),   sub: '∂V/∂t per day',         color: greeks.theta < 0 ? 'var(--red)' : null },
    { label: 'Rho',    value: greeks.rho.toFixed(4),     sub: '∂V/∂r per 1%',          color: null },
  ];

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header">
        <span className="card-title">Black-Scholes Output</span>
      </div>
      <div className="metric-grid">
        {items.map(item => (
          <div className="metric-box" key={item.label}>
            <div className="metric-label">{item.label}</div>
            <div className="metric-value" style={{ color: item.color, fontSize: 16 }}>
              {item.value}
            </div>
            <div className="metric-sub">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Theory Panel ─────────────────────────────────────────────────────────────

function TheoryPanel({ params, greeks, price }) {
  const [open, setOpen] = useState({ formula: true, greeks: false, intuition: false });

  const toggle = key => setOpen(o => ({ ...o, [key]: !o[key] }));

  const d1 = (Math.log(params.S / params.K) +
    (params.r - params.q + 0.5 * params.sigma ** 2) * params.T) /
    (params.sigma * Math.sqrt(params.T));
  const d2 = d1 - params.sigma * Math.sqrt(params.T);

  return (
    <div className="panel-right">
      <div style={{ marginBottom: 16 }}>
        <h2>Theory & Derivation</h2>
      </div>

      {/* Formula */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 0' }}
          onClick={() => toggle('formula')}
        >
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            {open.formula ? '▼' : '▶'} 1. The Formula
          </span>
        </div>
        {open.formula && (
          <div>
            <div className="formula-box">
              {params.type === 'call'
                ? 'C = S·e⁻ᵍᵀ·N(d₁) - K·e⁻ʳᵀ·N(d₂)'
                : 'P = K·e⁻ʳᵀ·N(-d₂) - S·e⁻ᵍᵀ·N(-d₁)'}
            </div>
            <div className="formula-box" style={{ marginTop: 6 }}>
              d₁ = [ln(S/K) + (r-q+σ²/2)·T] / (σ·√T)
            </div>
            <div className="formula-box" style={{ marginTop: 6 }}>
              d₂ = d₁ - σ·√T
            </div>
            <div className="info-box" style={{ marginTop: 8 }}>
              <strong>Current values:</strong><br />
              d₁ = {d1.toFixed(4)}<br />
              d₂ = {d2.toFixed(4)}<br />
              Price = {price.toFixed(4)}
            </div>
          </div>
        )}
      </div>

      {/* Greeks */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 0', borderTop: '1px solid var(--border)' }}
          onClick={() => toggle('greeks')}
        >
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            {open.greeks ? '▼' : '▶'} 2. The Greeks
          </span>
        </div>
        {open.greeks && (
          <div>
            {[
              { name: 'Delta', formula: 'N(d₁)', desc: 'Probability the option expires ITM. Also the hedge ratio — how many shares to hold to delta-hedge.' },
              { name: 'Gamma', formula: "N'(d₁) / (S·σ·√T)", desc: 'Rate of change of delta. High gamma = delta changes quickly with spot moves.' },
              { name: 'Vega',  formula: "S·N'(d₁)·√T", desc: 'Sensitivity to volatility. Long options are always long vega.' },
              { name: 'Theta', formula: 'Time decay', desc: 'How much the option loses per day. Almost always negative — options decay as time passes.' },
              { name: 'Rho',   formula: 'K·T·e⁻ʳᵀ·N(d₂)', desc: 'Sensitivity to interest rates. Usually small except for long-dated options.' },
            ].map(g => (
              <div key={g.name} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--accent)' }}>{g.name}</div>
                <div className="formula-box" style={{ margin: '4px 0' }}>{g.formula}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{g.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Intuition */}
      <div>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 0', borderTop: '1px solid var(--border)' }}
          onClick={() => toggle('intuition')}
        >
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            {open.intuition ? '▼' : '▶'} 3. Intuition
          </span>
        </div>
        {open.intuition && (
          <div className="info-box">
            <strong>What is N(d₁)?</strong><br />
            N(d₁) is the delta — the probability (risk-neutral) that the option expires in-the-money, adjusted for the fact that when ITM you receive the stock.<br /><br />
            <strong>What is N(d₂)?</strong><br />
            N(d₂) is the pure probability that the option expires ITM under the risk-neutral measure.<br /><br />
            <strong>The formula decomposed:</strong><br />
            Call = PV(receive stock if ITM) - PV(pay strike if ITM)<br />
            = S·N(d₁) - K·e⁻ʳᵀ·N(d₂)
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OptionsPricer() {
  const [params, setParams] = useState({
    S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, q: 0, type: 'call'
  });

  const onChange = (key, value) => {
    setParams(p => ({ ...p, [key]: value }));
  };

  const price  = useMemo(() => blackScholes(params.S, params.K, params.T, params.r, params.sigma, params.q, params.type), [params]);
  const greeks = useMemo(() => calcGreeks(params.S, params.K, params.T, params.r, params.sigma, params.q, params.type), [params]);

  return (
    <div className="panel-layout" style={{ height: 'calc(100vh - 48px)' }}>
      <InputPanel params={params} onChange={onChange} />
      <div className="panel-center">
        <div style={{ marginBottom: 20 }}>
          <h1>⚡ Options Pricer</h1>
          <p style={{ marginTop: 4 }}>
            Black-Scholes analytical pricing with real-time Greeks
          </p>
        </div>
        <GreeksPanel greeks={greeks} price={price} />
      </div>
      <TheoryPanel params={params} greeks={greeks} price={price} />
    </div>
  );
}