// src/pages/VolSurface.js
// Volatility Surface — implied vol across strikes and maturities

import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
// ── Vol Surface Generator ─────────────────────────────────────────────────────

/**
 * Generates a realistic volatility surface using the SVI (Stochastic Volatility Inspired)
 * parametrization — a common industry model for fitting vol surfaces.
 *
 * The surface captures two key real-world phenomena:
 * 1. Volatility SMILE — IV is higher for OTM options than ATM
 * 2. Volatility SKEW — for equities, puts are more expensive than calls (fear of crashes)
 * 3. Term structure — short-dated vol reacts more to spot moves than long-dated vol
 */
function generateVolSurface(S0, r, atmVol, skew, smile, termSlope) {
  const strikes = Array.from({ length: 20 }, (_, i) => S0 * (0.6 + i * 0.04));
  const maturities = [1/12, 2/12, 3/12, 6/12, 9/12, 1, 1.5, 2];

  const surface = maturities.map(T => {
    return strikes.map(K => {
      const moneyness = Math.log(K / S0) / Math.sqrt(T); // log-moneyness normalized by sqrt(T)

      // SVI-inspired parametrization:
      // Base vol = ATM vol adjusted for term structure
      const baseVol = atmVol + termSlope * (1 - Math.sqrt(T));

      // Skew — linear in moneyness (puts more expensive than calls for equities)
      const skewEffect = skew * moneyness;

      // Smile — quadratic in moneyness (both wings more expensive than ATM)
      const smileEffect = smile * moneyness * moneyness;

      // Total implied vol
      const iv = Math.max(baseVol + skewEffect + smileEffect, 0.01);

      return iv;
    });
  });

  return { strikes, maturities, surface };
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function VolSurface() {
  const S0 = 100;
  const r  = 0.05;

  const [atmVol,    setAtmVol]    = useState(0.20);
  const [skew,      setSkew]      = useState(-0.10);
  const [smile,     setSmile]     = useState(0.05);
  const [termSlope, setTermSlope] = useState(0.05);
  const [activeTab, setActiveTab] = useState('surface');

  const { strikes, maturities, surface } = useMemo(() =>
    generateVolSurface(S0, r, atmVol, skew, smile, termSlope),
    [atmVol, skew, smile, termSlope]
  );

  const maturityLabels = maturities.map(T => {
    if (T < 1) return `${Math.round(T * 12)}M`;
    return `${T}Y`;
  });

  const sliderStyle = { width: '100%', accentColor: 'var(--accent)', margin: '4px 0 12px' };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>🌐 Volatility Surface</h1>
        <p style={{ marginTop: 4 }}>
          Implied volatility across strikes and maturities — the most important structure in options markets.
        </p>
      </div>

      {/* What is a Vol Surface */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">What is a Volatility Surface?</span>
        </div>
        <div className="grid-2" style={{ gap: 24 }}>
          <div>
            <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
              Black-Scholes assumes volatility is <strong>constant</strong> — the same for all 
              strikes and maturities. In reality, this is completely wrong. The market prices 
              different options with different implied volatilities, creating a 
              <strong> 3D surface</strong> of IV across strikes and maturities.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              The vol surface is the market's collective view on the distribution of future 
              returns — encoding fear, supply/demand for options, and expectations about 
              future volatility regimes. Every options trader and market maker monitors 
              the vol surface continuously.
            </p>
          </div>
          <div>
            {[
              {
                title: 'Volatility Smile',
                desc: 'IV is higher for OTM options (both calls and puts) than ATM options. The market assigns higher probability to extreme moves than a normal distribution would suggest — fat tails.',
              },
              {
                title: 'Volatility Skew',
                desc: 'For equity indices, OTM puts are more expensive than OTM calls. Investors pay a premium for crash protection — fear of large down moves is greater than fear of large up moves.',
              },
              {
                title: 'Term Structure',
                desc: 'Short-dated options often have higher IV than long-dated (inverted term structure) during stress, and lower IV during calm markets (normal term structure).',
              },
            ].map(item => (
              <div key={item.title} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 3 }}>{item.title}</div>
                <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Surface Parameters</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            SVI-inspired parametrization · S₀ = {S0}
          </span>
        </div>
        <div className="info-box" style={{ marginBottom: 16, fontSize: 12 }}>
          <strong>Note on data:</strong> This surface is generated using a realistic 
          parametric model (SVI — Stochastic Volatility Inspired), not live market data. 
          In production, implied vols are extracted from real option prices using 
          Black-Scholes inversion. The shape and dynamics are calibrated to be 
          representative of real equity index vol surfaces (e.g. SPX).
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { label: 'ATM Vol (σ)', value: atmVol, set: setAtmVol, min: 0.05, max: 0.6, step: 0.01, format: v => `${(v*100).toFixed(0)}%`, desc: 'At-the-money implied volatility — the baseline level of the surface' },
            { label: 'Skew', value: skew, set: setSkew, min: -0.3, max: 0.1, step: 0.01, format: v => v.toFixed(2), desc: 'Slope of IV vs moneyness. Negative = puts expensive (equity skew)' },
            { label: 'Smile', value: smile, set: setSmile, min: 0, max: 0.2, step: 0.01, format: v => v.toFixed(2), desc: 'Curvature of the smile. Higher = more convex, fatter tails' },
            { label: 'Term Slope', value: termSlope, set: setTermSlope, min: -0.1, max: 0.15, step: 0.01, format: v => v.toFixed(2), desc: 'How vol changes with maturity. Positive = short-dated vol higher' },
          ].map(p => (
            <div key={p.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="input-label">{p.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{p.format(p.value)}</span>
              </div>
              <input type="range" min={p.min} max={p.max} step={p.step}
                value={p.value} onChange={e => p.set(Number(e.target.value))}
                style={sliderStyle} />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'surface', label: ' 3D Surface' },
          { key: 'smile',   label: ' Vol Smile' },
          { key: 'term',    label: ' Term Structure' },
        ].map(t => (
          <div key={t.key}
            className={`tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}>
            {t.label}
          </div>
        ))}
      </div>

      {/* 3D Surface */}
      {activeTab === 'surface' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span className="card-title">Implied Volatility Surface</span>
          </div>
          <Plot
            data={[{
              type: 'surface',
              x: strikes.map(k => k.toFixed(0)),
              y: maturityLabels,
              z: surface,
              colorscale: 'RdYlGn',
              reversescale: true,
              showscale: true,
              colorbar: { title: 'IV', thickness: 15 },
            }]}
            layout={{
              height: 450,
              margin: { t: 10, b: 10, l: 10, r: 10 },
              scene: {
                xaxis: { title: 'Strike (K)' },
                yaxis: { title: 'Maturity' },
                zaxis: { title: 'Implied Vol' },
                camera: { eye: { x: 1.5, y: -1.5, z: 0.8 } },
              },
              paper_bgcolor: 'rgba(0,0,0,0)',
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%' }}
          />
          <div className="info-box" style={{ marginTop: 8, fontSize: 12 }}>
            <strong>How to read:</strong> The Z-axis shows implied volatility. 
            Red = high IV (expensive options), Green = low IV (cheap options). 
            Notice how the surface is not flat — ATM options are cheapest, 
            OTM options in both directions are more expensive (smile). 
            Puts are more expensive than equidistant calls (skew).
          </div>
        </div>
      )}

      {/* Vol Smile */}
      {activeTab === 'smile' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span className="card-title">Volatility Smile by Maturity</span>
          </div>
          <Plot
            data={maturities.map((T, i) => ({
              x: strikes,
              y: surface[i].map(v => v * 100),
              type: 'scatter',
              mode: 'lines',
              name: maturityLabels[i],
              line: { width: 2 },
            }))}
            layout={{
              height: 400,
              margin: { t: 10, b: 40, l: 50, r: 20 },
              xaxis: { title: 'Strike (K)' },
              yaxis: { title: 'Implied Vol (%)' },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              legend: { orientation: 'h', y: 1.1 },
              font: { size: 11 },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%' }}
          />
          <div className="info-box" style={{ marginTop: 8, fontSize: 12 }}>
            <strong>What you see:</strong> Each line is the vol smile for a different maturity. 
            The smile is more pronounced for short-dated options — short-dated vol reacts 
            more aggressively to moneyness. Long-dated smiles are flatter because 
            there is more time for mean-reversion.
          </div>
        </div>
      )}

      {/* Term Structure */}
      {activeTab === 'term' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span className="card-title">Volatility Term Structure (ATM)</span>
          </div>
          <Plot
            data={[{
              x: maturityLabels,
              y: maturities.map((T, i) => {
                const atmIdx = Math.floor(strikes.length / 2);
                return surface[i][atmIdx] * 100;
              }),
              type: 'scatter',
              mode: 'lines+markers',
              line: { color: '#2563eb', width: 2 },
              marker: { size: 8 },
              name: 'ATM IV',
            }]}
            layout={{
              height: 350,
              margin: { t: 10, b: 40, l: 50, r: 20 },
              xaxis: { title: 'Maturity' },
              yaxis: { title: 'ATM Implied Vol (%)' },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { size: 11 },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%' }}
          />
          <div className="info-box" style={{ marginTop: 8, fontSize: 12 }}>
            <strong>Term structure signals:</strong><br/>
            <strong>Normal (upward sloping):</strong> Market expects vol to be higher in the future — calm now, uncertain later.<br/>
            <strong>Inverted (downward sloping):</strong> Short-dated options expensive — current stress or event risk (earnings, FOMC). Vol expected to mean-revert lower.<br/>
            <strong>Flat:</strong> Market has no strong view on future vol regime.
          </div>

          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <h3 style={{ marginBottom: 12 }}>Why Does the Term Structure Matter?</h3>
            <div className="grid-2" style={{ gap: 16 }}>
              {[
                {
                  title: 'Calendar Spreads',
                  desc: 'Traders exploit the term structure by buying short-dated vol and selling long-dated vol (or vice versa). If the term structure is inverted and expected to normalize, selling front-month vol and buying back-month vol captures the normalization.',
                },
                {
                  title: 'Event Pricing',
                  desc: 'Specific events (FOMC, earnings, elections) cause "kinks" in the term structure — the expiry just after the event has elevated IV. Traders can buy pre-event vol and sell post-event vol to isolate the event premium.',
                },
              ].map(item => (
                <div key={item.title} style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '12px 14px',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{item.title}</div>
                  <p style={{ fontSize: 12, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Why Vol Surface Matters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Why the Vol Surface Breaks Black-Scholes</span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
          If Black-Scholes were correct, the vol surface would be completely flat — 
          every option on the same underlying would have the same implied vol. 
          The fact that it is not flat tells us that the market knows Black-Scholes is wrong.
        </p>
        <div className="grid-2" style={{ gap: 16 }}>
          {[
            {
              title: 'Fat Tails',
              desc: 'Black-Scholes assumes log-normal returns. Real returns have fat tails — extreme moves happen more often than the model predicts. OTM options are more expensive because the market knows crashes happen.',
            },
            {
              title: 'Jump Risk',
              desc: 'Stocks can gap down overnight or on news. Black-Scholes assumes continuous price paths. Short-dated OTM puts are expensive because they protect against these gaps.',
            },
            {
              title: 'Stochastic Volatility',
              desc: 'Vol is not constant — it is itself random. When vol is high, it creates more demand for options, pushing IV higher. Models like Heston and SABR extend Black-Scholes to allow vol to be stochastic.',
            },
            {
              title: 'Supply & Demand',
              desc: 'Structural demand for puts from portfolio managers and structured product hedging creates persistent skew. This is not just a model artifact — it reflects real market microstructure.',
            },
          ].map(item => (
            <div key={item.title} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '12px 14px',
            }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{item.title}</div>
              <p style={{ fontSize: 12, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}