// src/pages/PDESolver.js
// PDE Solver — Finite Difference Method visualization

import React, { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { solvePDE } from '../utils/pde';

// ── Input Panel ───────────────────────────────────────────────────────────────

function InputPanel({ params, onChange, onCompute, computing }) {
  const fields = [
    { key: 'S0',    label: 'Spot (S₀)',      step: 1    },
    { key: 'K',     label: 'Strike (K)',      step: 1    },
    { key: 'T',     label: 'Maturity (T)',    step: 0.1  },
    { key: 'r',     label: 'Rate (r)',        step: 0.001 },
    { key: 'sigma', label: 'Vol (σ)',         step: 0.01 },
    { key: 'NS',    label: 'Steps (Nₛ)',      step: 10   },
    { key: 'NT',    label: 'Steps (Nₜ)',      step: 10   },
    { key: 'Smax',  label: 'Max S',           step: 10   },
  ];

  return (
    <div className="panel-left">
      <div style={{ marginBottom: 20 }}>
        <h2>Parameters</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Configure the PDE grid and market parameters
        </p>
      </div>

      {/* Option Type */}
      <div style={{ marginBottom: 12 }}>
        <div className="input-label" style={{ marginBottom: 4 }}>Option Type</div>
        <select className="select-field" style={{ width: '100%' }}
          value={params.type} onChange={e => onChange('type', e.target.value)}>
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </div>

      {/* Scheme */}
      <div style={{ marginBottom: 12 }}>
        <div className="input-label" style={{ marginBottom: 4 }}>Numerical Scheme</div>
        <select className="select-field" style={{ width: '100%' }}
          value={params.scheme} onChange={e => onChange('scheme', e.target.value)}>
          <option value="crankNicolson">Crank-Nicolson</option>
          <option value="implicit">Implicit</option>
          <option value="explicit">Explicit</option>
        </select>
      </div>

      {/* Market / Grid fields */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Market / Option</div>
        {fields.slice(0, 5).map(f => (
          <div className="input-group" key={f.key}>
            <label className="input-label">{f.label}</label>
            <input type="number" className="input-field"
              value={params[f.key]} step={f.step}
              onChange={e => onChange(f.key, parseFloat(e.target.value))} />
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Numerical Grid</div>
        {fields.slice(5).map(f => (
          <div className="input-group" key={f.key}>
            <label className="input-label">{f.label}</label>
            <input type="number" className="input-field"
              value={params[f.key]} step={f.step}
              onChange={e => onChange(f.key, parseFloat(e.target.value))} />
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onCompute} disabled={computing}>
        {computing ? 'Computing...' : 'Recompute PDE Solution'}
      </button>
    </div>
  );
}

// ── Theory Panel ──────────────────────────────────────────────────────────────

function TheoryPanel({ result, params }) {
  const [open, setOpen] = useState({ pde: true, schemes: false, stability: false });
  const toggle = key => setOpen(o => ({ ...o, [key]: !o[key] }));

  return (
    <div className="panel-right">
      <div style={{ marginBottom: 16 }}>
        <h2>Derivation & Theory</h2>
      </div>

      {/* Status */}
      {result && (
        <div style={{ marginBottom: 16 }}>
          <div className={`status-badge ${result.stable ? 'green' : 'red'}`} style={{ fontSize: 12, padding: '4px 10px' }}>
            {result.stable ? '✓ Converged' : '✗ Unstable'}
          </div>
          {!result.stable && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Warning: Explicit scheme is unstable if Δt is too large relative to ΔS².
            </p>
          )}
        </div>
      )}

      {/* The PDE */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--border)' }}
          onClick={() => toggle('pde')}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            {open.pde ? '▼' : '▶'} 1. The Setup (SDE)
          </span>
        </div>
        {open.pde && (
          <div style={{ paddingTop: 12 }}>
            <p style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
              Stock price follows Geometric Brownian Motion:
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>dS = μS dt + σS dW</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
              Applying Itô's Lemma to V(S,t) and constructing a delta-hedged portfolio, 
              by no-arbitrage we obtain the Black-Scholes PDE:
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>∂V/∂t + ½σ²S²·∂²V/∂S² + (r-q)S·∂V/∂S - rV = 0</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
              <strong>Final Condition (t = T):</strong>
            </p>
            <div className="formula-box">
              {params.type === 'call' ? 'V(S,T) = max(S - K, 0) for a Call' : 'V(S,T) = max(K - S, 0) for a Put'}
            </div>
          </div>
        )}
      </div>

      {/* Schemes */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--border)' }}
          onClick={() => toggle('schemes')}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            {open.schemes ? '▼' : '▶'} 2. Numerical Schemes
          </span>
        </div>
        {open.schemes && (
          <div style={{ paddingTop: 12 }}>
            {[
              {
                name: 'Explicit',
                formula: 'Vᵢⁿ = αVᵢ₋₁ⁿ⁺¹ + βVᵢⁿ⁺¹ + γVᵢ₊₁ⁿ⁺¹',
                desc: 'Simple — new values computed directly from old values. Conditionally stable: requires Δt ≤ ΔS²/(σ²S²). Can explode if step sizes are too large.',
              },
              {
                name: 'Implicit',
                formula: 'Solves tridiagonal system at each step',
                desc: 'Unconditionally stable — any step size works. Less accurate than Crank-Nicolson for the same step size. Requires Thomas algorithm.',
              },
              {
                name: 'Crank-Nicolson',
                formula: 'Average of Explicit + Implicit (θ = 0.5)',
                desc: 'The gold standard. Unconditionally stable AND second-order accurate in both time and space. Industry standard for option pricing PDEs.',
              },
            ].map(s => (
              <div key={s.name} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--accent)', marginBottom: 4 }}>{s.name}</div>
                <div className="formula-box" style={{ marginBottom: 4, fontSize: 11 }}>{s.formula}</div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stability */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--border)' }}
          onClick={() => toggle('stability')}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            {open.stability ? '▼' : '▶'} 3. Analytical Formula
          </span>
        </div>
        {open.stability && (
          <div style={{ paddingTop: 12 }}>
            <p style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
              The BS PDE has an exact analytical solution obtained by transforming 
              it into the heat equation. The red dashed line in the chart shows this exact solution — 
              the numerical scheme should converge to it as grid size increases.
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>C = S·N(d₁) - K·e⁻ʳᵀ·N(d₂)</div>
            <div className="info-box" style={{ fontSize: 11 }}>
              The residual error chart shows (Numerical - Analytical). 
              For Crank-Nicolson, error is O(ΔS² + Δt²). 
              For Explicit/Implicit, error is O(ΔS² + Δt).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PDESolver() {
  const [params, setParams] = useState({
    S0: 100, K: 100, T: 1, r: 0.05, sigma: 0.2,
    type: 'call', scheme: 'crankNicolson',
    NS: 100, NT: 100, Smax: 300,
  });

  const [result, setResult] = useState(null);
  const [computing, setComputing] = useState(false);

  const onChange = (key, value) => setParams(p => ({ ...p, [key]: value }));

  const onCompute = useCallback(() => {
    setComputing(true);
    setTimeout(() => {
      try {
        const res = solvePDE(
          params.S0, params.K, params.T, params.r, params.sigma,
          0, params.type, params.scheme, params.NS, params.NT, params.Smax
        );
        setResult(res);
      } catch (e) {
        console.error(e);
      }
      setComputing(false);
    }, 50);
  }, [params]);

  return (
    <div className="panel-layout" style={{ height: 'calc(100vh - 48px)' }}>
      <InputPanel params={params} onChange={onChange} onCompute={onCompute} computing={computing} />

      <div className="panel-center">
        <div style={{ marginBottom: 20 }}>
          <h1>🔢 PDE Solver</h1>
          <p style={{ marginTop: 4 }}>
            Finite Difference Method solver for the Black-Scholes PDE — 
            numerical vs analytical comparison
          </p>
        </div>

        {!result && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔢</div>
            <h2 style={{ marginBottom: 8 }}>Ready to Solve</h2>
            <p>Set parameters and click <strong>Recompute PDE Solution</strong> to run the solver.</p>
          </div>
        )}

        {result && (
          <>
            {/* 3D Surface */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <span className="card-title">V(S,t) — Option Price Surface</span>
              </div>
              <Plot
                data={[{
                    type: 'surface',
                    x: result.S,
                    y: [0, params.T],
                    z: [result.V_analytical, result.V_numerical],
                    colorscale: 'Viridis',
                    showscale: true,
                    opacity: 0.9,
                }]}
                layout={{
                  height: 300,
                  margin: { t: 10, b: 10, l: 10, r: 10 },
                  scene: {
                    xaxis: { title: 'Spot (S)' },
                    yaxis: { title: 'Time (t)' },
                    zaxis: { title: 'Price (V)' },
                  },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </div>

            {/* Delta chart + Residual */}
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">t = 0 — Numerical vs Analytical</span>
                </div>
                <Plot
                  data={[
                    {
                      x: result.S,
                      y: result.V_numerical,
                      type: 'scatter', mode: 'lines',
                      line: { color: '#dc2626', width: 2 },
                      name: 'FDM Grid',
                    },
                    {
                      x: result.S,
                      y: result.V_analytical,
                      type: 'scatter', mode: 'lines',
                      line: { color: '#2563eb', width: 1.5, dash: 'dot' },
                      name: 'Exact (Formula)',
                    },
                  ]}
                  layout={{
                    height: 220,
                    margin: { t: 10, b: 30, l: 40, r: 10 },
                    xaxis: { title: 'Spot Price (S)' },
                    yaxis: { title: 'Price (V)' },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    legend: { orientation: 'h', y: 1.1 },
                    font: { size: 11 },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Residual Error (Numerical - Analytical)</span>
                </div>
                <Plot
                  data={[{
                    x: result.S,
                    y: result.residual,
                    type: 'scatter', mode: 'lines',
                    fill: 'tozeroy',
                    line: { color: '#9333ea', width: 1.5 },
                    name: 'Residual',
                  }]}
                  layout={{
                    height: 220,
                    margin: { t: 10, b: 30, l: 40, r: 10 },
                    xaxis: { title: 'Spot Price (S)' },
                    yaxis: { title: 'Residual Error' },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { size: 11 },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <TheoryPanel result={result} params={params} />
    </div>
  );
}