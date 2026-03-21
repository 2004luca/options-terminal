// src/pages/Derivatives101.js
// Derivatives 101 — A complete guide to derivatives and options

import React, { useState } from 'react';

// ── Collapsible Section ───────────────────────────────────────────────────────

function Section({ number, title, children }) {
  const [open, setOpen] = useState(number === 1);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', userSelect: 'none',
        }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--accent)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          {number}
        </div>
        <h2 style={{ flex: 1 }}>{title}</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>
          {open ? '▲' : '▼'}
        </span>
      </div>
      {open && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Comparison Table ──────────────────────────────────────────────────────────

function ComparisonTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '8px 12px', textAlign: 'left',
                background: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border)',
                fontWeight: 600, color: 'var(--text-primary)',
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '8px 12px',
                  color: j === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: j === 0 ? 600 : 400,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Derivatives101() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>Derivatives 101</h1>
        <p style={{ marginTop: 4 }}>
          A complete guide to derivatives, options pricing, Greeks, and real-world applications.
        </p>
      </div>

      {/* ── 1. What are Derivatives ── */}
      <Section number={1} title="What are Derivatives?">
        <p style={{ marginBottom: 12 }}>
          A <strong>derivative</strong> is a financial contract whose value depends on 
          (is "derived from") the price of an underlying asset — a stock, bond, currency, 
          commodity, or even another derivative.
        </p>
        <p style={{ marginBottom: 16 }}>
          Derivatives serve three main purposes in financial markets:
        </p>
        <div className="grid-3" style={{ marginBottom: 16 }}>
          {[
            { title: 'Hedging', desc: 'Reducing risk by taking an offsetting position. An airline buys oil futures to lock in fuel costs. A company buys FX options to protect against currency moves.' },
            { title: 'Speculation', desc: 'Taking a leveraged view on price direction. A trader buys call options to profit from a stock rally with limited downside (the premium paid).' },
            { title: 'Arbitrage', desc: 'Exploiting price differences between related instruments to lock in risk-free profit. Keeps markets efficient and prices consistent.' },
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
        <div className="info-box">
          The global derivatives market is estimated at <strong>over $600 trillion</strong> in 
          notional value — dwarfing the global GDP of ~$100 trillion. Most of this is interest 
          rate derivatives used by banks and corporations to manage rate risk.
        </div>
      </Section>

      {/* ── 2. The 4 Main Types ── */}
      <Section number={2} title="The 4 Main Types of Derivatives">
        <ComparisonTable
          headers={['Type', 'Obligation', 'Traded', 'Settlement', 'Example']}
          rows={[
            ['Forward',  'Both parties obligated', 'OTC (private)', 'At maturity', 'Buy 1M barrels of oil in 6 months at $80'],
            ['Future',   'Both parties obligated', 'Exchange', 'Daily mark-to-market', 'WTI crude oil futures on NYMEX'],
            ['Swap',     'Both parties obligated', 'OTC / CCP', 'Periodic cash flows', 'Pay fixed 5%, receive SOFR floating'],
            ['Option',   'Buyer has right, seller has obligation', 'Exchange / OTC', 'At exercise', 'Right to buy AAPL at $200 in 3 months'],
          ]}
        />

        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Deep Dive: Key Differences</h3>
          <div className="grid-2" style={{ gap: 16 }}>
            {[
              {
                title: 'Forwards vs Futures',
                content: `Both are agreements to buy/sell at a future date at a fixed price. The key differences:
                
- Forwards are OTC (bilateral, customizable, counterparty risk)
- Futures are exchange-traded (standardized, daily margin calls, virtually no counterparty risk)
- Futures require a margin deposit — typically 5-10% of notional
- Daily mark-to-market means gains/losses are settled daily (futures) vs at maturity (forwards)`
              },
              {
                title: 'Interest Rate Swaps',
                content: `The most common derivative in the world. Two parties exchange cash flows:
                
- Party A pays a fixed rate (e.g. 4%)
- Party B pays a floating rate (e.g. SOFR + spread)
- No principal exchanged — only the interest difference
- Used by companies to convert floating-rate debt to fixed (or vice versa)
- Also used to speculate on interest rate direction`
              },
              {
                title: 'Why Options are Special',
                content: `Options are unique because they give the buyer a right, not an obligation:
                
- The buyer pays a premium upfront for this right
- Maximum loss for the buyer = premium paid (limited risk)
- Maximum loss for the seller = potentially unlimited
- This asymmetry is what makes options pricing non-trivial
- The premium must reflect the probability of exercise — this is what Black-Scholes solves`
              },
              {
                title: 'Currency Forwards (FX Forwards)',
                content: `The most common use of forwards in the real world:
                
- A US company expecting €10M revenue in 6 months
- Risk: EUR/USD could fall, reducing USD revenue
- Solution: sell €10M forward at today's forward rate
- Locks in the exchange rate — eliminating FX uncertainty
- The forward rate is set by covered interest rate parity:
  F = S × (1 + r_domestic) / (1 + r_foreign)`
              },
            ].map(item => (
              <div key={item.title} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '14px 16px',
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{item.title}</div>
                <p style={{ fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 3. Options Deep Dive ── */}
      <Section number={3} title="Options Deep Dive">
        <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '14px 16px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--green)' }}>Call Option</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
              The right to <strong>buy</strong> the underlying at the strike price K before/at expiry.
            </p>
            <div className="formula-box">Payoff = max(S - K, 0)</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>
              Profit if S &gt; K + premium. Used when bullish on the underlying.
            </p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '14px 16px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--red)' }}>Put Option</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
              The right to <strong>sell</strong> the underlying at the strike price K before/at expiry.
            </p>
            <div className="formula-box">Payoff = max(K - S, 0)</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>
              Profit if S &lt; K - premium. Used when bearish or for portfolio protection.
            </p>
          </div>
        </div>

        <h3 style={{ marginBottom: 12 }}>Moneyness — ITM, ATM, OTM</h3>
        <ComparisonTable
          headers={['Term', 'Call', 'Put', 'Intrinsic Value', 'Typical Delta']}
          rows={[
            ['In-the-Money (ITM)',    'S > K', 'S < K', 'Positive — has intrinsic value', '0.6 to 1.0'],
            ['At-the-Money (ATM)',    'S ≈ K', 'S ≈ K', 'Zero — only time value', '≈ 0.5'],
            ['Out-of-the-Money (OTM)','S < K', 'S > K', 'Zero — only time value', '0 to 0.4'],
          ]}
        />

        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Intrinsic Value vs Time Value</h3>
          <div className="info-box">
            <strong>Option Price = Intrinsic Value + Time Value</strong><br /><br />
            <strong>Intrinsic value</strong> — what the option is worth if exercised immediately.
            For a call: max(S - K, 0). For a put: max(K - S, 0).<br /><br />
            <strong>Time value</strong> — the extra premium paid for the possibility that the option 
            moves further ITM before expiry. Depends on time remaining, volatility, and interest rates.
            Always decays to zero at expiry (theta decay).<br /><br />
            <strong>Example:</strong> AAPL at $150, call strike K=$140, option price = $12<br />
            Intrinsic value = $150 - $140 = $10<br />
            Time value = $12 - $10 = $2
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 12 }}>American vs European Options</h3>
          <ComparisonTable
            headers={['Type', 'Exercise', 'Premium', 'Common Use']}
            rows={[
              ['European', 'Only at expiry', 'Lower', 'Index options (SPX), most FX options'],
              ['American', 'Any time before expiry', 'Higher (early exercise right)', 'Equity options (AAPL, TSLA)'],
            ]}
          />
          <div className="info-box" style={{ marginTop: 12 }}>
            <strong>When is early exercise optimal?</strong> For American calls on non-dividend paying 
            stocks — almost never. The time value is always positive, so it is better to sell the option 
            than exercise early. For puts, early exercise can be optimal when deeply ITM and interest 
            rates are high.
          </div>
        </div>
      </Section>

      {/* ── 4. How Options are Priced ── */}
      <Section number={4} title="How Options are Priced — Black-Scholes">
        <p style={{ marginBottom: 16 }}>
          The price of an option depends on 6 variables. Understanding how each affects the price 
          is fundamental to options trading:
        </p>

        <ComparisonTable
          headers={['Variable', 'Symbol', 'Effect on Call', 'Effect on Put', 'Why']}
          rows={[
            ['Spot Price',    'S', '↑ increases', '↓ decreases', 'Higher spot = more likely call expires ITM'],
            ['Strike Price',  'K', '↓ decreases', '↑ increases', 'Higher strike = harder for call to expire ITM'],
            ['Time to Expiry','T', '↑ increases', '↑ increases', 'More time = more chance of large moves'],
            ['Volatility',    'σ', '↑ increases', '↑ increases', 'More vol = fatter tails = higher option value'],
            ['Risk-Free Rate','r', '↑ increases', '↓ decreases', 'Higher rates = lower PV of strike payment'],
            ['Dividend Yield','q', '↓ decreases', '↑ increases', 'Dividends reduce forward price of stock'],
          ]}
        />

        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 12 }}>From Brownian Motion to Black-Scholes</h3>
          
          <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            Black-Scholes is not just a formula — it is derived from first principles 
            using stochastic calculus. The derivation starts with a model for how stock 
            prices move through time.
          </p>

          {/* Step 1 — GBM */}
          <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--accent)' }}>
              Step 1 — Geometric Brownian Motion (GBM)
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
              We assume stock prices follow a <strong>Geometric Brownian Motion</strong> — 
              the most fundamental model in quantitative finance:
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>dS = μS dt + σS dW</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>Where:</p>
            {[
              ['dS', 'Infinitesimal change in stock price'],
              ['μ', 'Drift — the expected return of the stock (annualized)'],
              ['σ', 'Volatility — standard deviation of returns (annualized)'],
              ['dt', 'Infinitesimal time step'],
              ['dW', 'Wiener process increment — dW = ε√dt where ε ~ N(0,1)'],
            ].map(([sym, desc]) => (
              <div key={sym} style={{ display: 'flex', gap: 12, padding: '4px 0', fontSize: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)', minWidth: 30 }}>{sym}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{desc}</span>
              </div>
            ))}
            <div className="info-box" style={{ marginTop: 12, fontSize: 12 }}>
              <strong>What is a Wiener Process (Brownian Motion)?</strong><br/>
              A Wiener process W(t) is a continuous-time random process with 4 properties:
              W(0) = 0, independent increments, W(t) - W(s) ~ N(0, t-s), and continuous paths.
              It is the mathematical formalization of "random walk" in continuous time.
              The term σS dW adds randomness proportional to the stock price — 
              this ensures prices can never go negative (unlike arithmetic Brownian motion).
            </div>
          </div>

          {/* Step 2 — Ito's Lemma */}
          <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--accent)' }}>
              Step 2 — Itô's Lemma
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
              We want to find how the option price V(S,t) evolves over time. 
              In ordinary calculus, for V = f(S,t):
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>dV = (∂V/∂t)dt + (∂V/∂S)dS</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
              But S follows a stochastic process — so we cannot use ordinary calculus. 
              <strong> Itô's Lemma</strong> is the stochastic calculus equivalent of the chain rule:
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>dV = (∂V/∂t)dt + (∂V/∂S)dS + ½(∂²V/∂S²)(dS)²</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
              The extra term <code>½(∂²V/∂S²)(dS)²</code> is unique to stochastic calculus. 
              Since dW² = dt (a fundamental property of Brownian motion), substituting dS:
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>dV = (∂V/∂t + μS·∂V/∂S + ½σ²S²·∂²V/∂S²)dt + σS·∂V/∂S·dW</div>
            <div className="info-box" style={{ marginTop: 8, fontSize: 12 }}>
              <strong>Why does dW² = dt?</strong> This is the key result of stochastic calculus. 
              Since dW ~ N(0, dt), we have E[dW²] = dt and Var[dW²] = 2dt² ≈ 0 for small dt. 
              So dW² is deterministic in the limit — it equals dt with probability 1. 
              This is why the Itô correction term appears and why stochastic calculus differs 
              from ordinary calculus.
            </div>
          </div>

          {/* Step 3 — Delta Hedging */}
          <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--accent)' }}>
              Step 3 — Delta Hedging & No-Arbitrage
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
              Construct a portfolio Π = V - (∂V/∂S)·S — long the option, 
              short ∂V/∂S shares (delta hedge). The change in portfolio value:
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>dΠ = dV - (∂V/∂S)dS</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
              Substituting and simplifying — the dW terms cancel (the portfolio is riskless!):
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>dΠ = (∂V/∂t + ½σ²S²·∂²V/∂S²)dt</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
              Since this portfolio is riskless, by no-arbitrage it must earn the risk-free rate:
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>dΠ = rΠ dt = r(V - S·∂V/∂S)dt</div>
          </div>

          {/* Step 4 — The PDE */}
          <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--accent)' }}>
              Step 4 — The Black-Scholes PDE
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
              Equating the two expressions for dΠ and rearranging gives the 
              <strong> Black-Scholes Partial Differential Equation</strong>:
            </p>
            <div className="formula-box" style={{ marginBottom: 8 }}>∂V/∂t + ½σ²S²·∂²V/∂S² + rS·∂V/∂S - rV = 0</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
              With boundary condition for a call: V(S,T) = max(S - K, 0)
            </p>
            <div className="info-box" style={{ fontSize: 12 }}>
              <strong>This PDE has an analytical solution</strong> — the Black-Scholes formula. 
              It is solved using a change of variables that transforms it into the 
              <strong> heat equation</strong> from physics — one of the most studied PDEs in mathematics. 
              For more complex options (American, barrier, Asian), the PDE must be solved numerically — 
              which is exactly what the <strong>PDE Solver</strong> page of this terminal does.
            </div>
          </div>

          <h3 style={{ marginBottom: 12 }}>The Black-Scholes Formula</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            The analytical solution to the Black-Scholes PDE, under the risk-neutral measure 
            (replacing μ with r):
          </p>
          <div className="formula-box" style={{ marginBottom: 8 }}>C = S·e⁻ᵍᵀ·N(d₁) - K·e⁻ʳᵀ·N(d₂)</div>
          <div className="formula-box" style={{ marginBottom: 8 }}>d₁ = [ln(S/K) + (r - q + σ²/2)·T] / (σ·√T)</div>
          <div className="formula-box" style={{ marginBottom: 16 }}>d₂ = d₁ - σ·√T</div>

          <div className="grid-2" style={{ gap: 12 }}>
            {[
              { term: 'N(d₁)', desc: 'The delta — probability (risk-adjusted) that the option expires ITM, weighted by the stock price received.' },
              { term: 'N(d₂)', desc: 'The pure risk-neutral probability that the option expires ITM — probability of paying the strike.' },
              { term: 'S·e⁻ᵍᵀ·N(d₁)', desc: 'Present value of receiving the stock if the option expires ITM.' },
              { term: 'K·e⁻ʳᵀ·N(d₂)', desc: 'Present value of paying the strike if the option expires ITM.' },
            ].map(item => (
              <div key={item.term} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '10px 12px',
              }}>
                <div className="formula-box" style={{ marginBottom: 6, display: 'inline-block', padding: '2px 8px' }}>{item.term}</div>
                <p style={{ fontSize: 12, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="info-box" style={{ marginTop: 16 }}>
            <strong>Key assumptions of Black-Scholes:</strong> Continuous trading, no transaction costs, 
            constant volatility, log-normal stock returns, no dividends (base model), European exercise only. 
            In practice, all these assumptions are violated — which is why the model is a starting point, 
            not the final answer.
          </div>
        </div>
      </Section>

      {/* ── 5. The Greeks ── */}
      <Section number={5} title="The Greeks">
        <p style={{ marginBottom: 16 }}>
          The Greeks measure the sensitivity of an option's price to various inputs. 
          They are the primary risk management tools for options traders and market makers.
        </p>

        {[
          {
            greek: 'Δ Delta',
            formula: 'Call: N(d₁)   Put: N(d₁) - 1',
            range: '0 to 1 for calls, -1 to 0 for puts',
            desc: 'The most important Greek. Delta measures how much the option price changes for a $1 move in the underlying.',
            intuition: 'Delta ≈ probability the option expires ITM. An ATM option has delta ≈ 0.5 (50% chance of expiring ITM). A deep ITM option has delta ≈ 1 (moves dollar-for-dollar with the stock).',
            trading: 'Delta is the hedge ratio. To delta-hedge a short call with delta 0.6, buy 0.6 shares per option sold. This creates a portfolio insensitive to small spot moves.',
            color: '#2563eb',
          },
          {
            greek: 'Γ Gamma',
            formula: "N'(d₁) / (S·σ·√T)",
            range: 'Always positive, highest for ATM options near expiry',
            desc: 'Gamma is the rate of change of delta — the second derivative of option price with respect to spot.',
            intuition: 'High gamma means delta changes rapidly with spot moves. A long option position has positive gamma — you are always getting longer when the market rises and shorter when it falls (convexity).',
            trading: 'Gamma is what makes delta hedging imperfect. A delta-hedged position still has gamma risk — large moves will cause P&L even if delta-neutral. Long gamma positions profit from large moves; short gamma positions suffer.',
            color: '#16a34a',
          },
          {
            greek: 'ν Vega',
            formula: "S·e⁻ᵍᵀ·N'(d₁)·√T",
            range: 'Always positive for long options',
            desc: 'Vega measures the sensitivity of option price to a 1% change in implied volatility.',
            intuition: 'Long options are always long vega — you profit when implied vol rises. Short options are short vega. Vega is highest for ATM options and longer-dated options.',
            trading: 'When you buy an option, you are not just buying direction — you are buying volatility. If you buy a call because you expect the stock to rise but implied vol falls, you can still lose money even if you are right on direction.',
            color: '#9333ea',
          },
          {
            greek: 'Θ Theta',
            formula: '-(S·σ·N\'(d₁)) / (2·√T) - r·K·e⁻ʳᵀ·N(d₂)',
            range: 'Almost always negative for long options',
            desc: 'Theta is the daily time decay of an option — how much value it loses each day, all else equal.',
            intuition: 'Options are wasting assets. Every day that passes, the option has less time for the underlying to make a favorable move. ATM options near expiry decay fastest (theta accelerates).',
            trading: 'Theta and gamma are opposite sides of the same coin. Long gamma (profit from moves) = short theta (pay daily decay). Short gamma (collect daily decay) = long gamma risk. This trade-off is the core of options market making.',
            color: '#dc2626',
          },
          {
            greek: 'ρ Rho',
            formula: 'K·T·e⁻ʳᵀ·N(d₂) / 100',
            range: 'Positive for calls, negative for puts',
            desc: 'Rho measures sensitivity to a 1% change in the risk-free interest rate.',
            intuition: 'Higher rates increase the present value of the "not paying the strike" benefit for calls. For puts, higher rates reduce the PV of receiving the strike.',
            trading: 'Rho is usually the least important Greek for short-dated options. For longer-dated options (LEAPS) or in high rate environments, rho becomes more significant.',
            color: '#d97706',
          },
        ].map(g => (
          <div key={g.greek} style={{
            marginBottom: 16,
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${g.color}`,
            borderRadius: 6,
            padding: '14px 16px',
            background: 'var(--bg-secondary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: g.color }}>{g.greek}</span>
              <div className="formula-box" style={{ display: 'inline-block', padding: '2px 8px', fontSize: 12 }}>{g.formula}</div>
            </div>
            <p style={{ fontSize: 13, marginBottom: 8 }}><strong>What it measures:</strong> {g.desc}</p>
            <p style={{ fontSize: 13, marginBottom: 8 }}><strong>Intuition:</strong> {g.intuition}</p>
            <p style={{ fontSize: 13 }}><strong>Trading use:</strong> {g.trading}</p>
          </div>
        ))}
      </Section>

      {/* ── 6. Key Concepts ── */}
      <Section number={6} title="Key Concepts">
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Put-Call Parity</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            One of the most fundamental relationships in options theory. For European options on 
            the same underlying with the same strike and expiry:
          </p>
          <div className="formula-box" style={{ marginBottom: 12 }}>C - P = S·e⁻ᵍᵀ - K·e⁻ʳᵀ</div>
          <div className="info-box">
            This means a call and a put (same K, T) plus a risk-free bond equals the stock. 
            If this relationship is violated, there is an arbitrage opportunity. 
            In practice, put-call parity holds tightly in liquid markets and is used to:
            <br/>• Check for arbitrage
            <br/>• Derive implied vol from put prices when call prices are known
            <br/>• Understand synthetic positions (synthetic long = long call + short put)
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Implied vs Realized Volatility</h3>
          <ComparisonTable
            headers={['', 'Implied Volatility (IV)', 'Realized Volatility (RV)']}
            rows={[
              ['Definition', "Market's expectation of future vol, derived from option prices", 'Actual historical vol, calculated from price returns'],
              ['Direction', 'Forward-looking', 'Backward-looking'],
              ['Source', 'Options market (supply/demand)', 'Price history'],
              ['Use', 'Options pricing, vol trading', 'Risk management, model calibration'],
            ]}
          />
          <div className="info-box" style={{ marginTop: 12 }}>
            <strong>The vol risk premium:</strong> IV tends to be higher than subsequent RV on average. 
            This is because option sellers demand a premium for bearing gamma risk. 
            The difference (IV - RV) is the "variance risk premium" — and capturing it is a common 
            strategy for volatility hedge funds.
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 12 }}>Risk-Neutral Pricing</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            The most important concept in derivatives pricing. Black-Scholes prices options under 
            the <strong>risk-neutral measure</strong> — a mathematical construct where all assets 
            grow at the risk-free rate.
          </p>
          <div className="info-box">
            <strong>Why does this work?</strong> Because we can delta-hedge — by continuously 
            rebalancing a portfolio of the option and the underlying, we can eliminate all market 
            risk. A riskless portfolio must earn the risk-free rate (no-arbitrage). 
            This means the actual expected return of the stock is irrelevant to option pricing — 
            only the risk-free rate matters. This is why two investors with completely different 
            views on where a stock is going will agree on the option price.
          </div>
        </div>
      </Section>

      {/* ── 7. Hedging & Risk Management ── */}
      <Section number={7} title="Hedging & Risk Management">
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Delta Hedging</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            A market maker who sells an option takes on directional risk. Delta hedging neutralizes 
            this risk by holding an offsetting position in the underlying.
          </p>
          <div className="info-box" style={{ marginBottom: 12 }}>
            <strong>Example:</strong> A market maker sells 100 call options on AAPL with delta = 0.6.<br/>
            Net delta = -100 × 0.6 = -60 (short 60 deltas)<br/>
            To hedge: buy 60 shares of AAPL<br/>
            Portfolio delta = -60 + 60 = 0 ✓ (delta-neutral)
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>
            But as AAPL moves, delta changes (because of gamma). The market maker must 
            continuously rebalance the hedge — this is called <strong>dynamic delta hedging</strong>.
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Gamma Scalping</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            A long gamma position profits from large moves even when delta-hedged. Here is why:
          </p>
          <div className="grid-2" style={{ gap: 12 }}>
            {[
              { title: 'Stock rises $5', desc: 'Delta increases (positive gamma). You are now long more delta than your hedge. Re-hedge by selling shares at the higher price — lock in profit.' },
              { title: 'Stock falls $5', desc: 'Delta decreases. You are now short more delta than your hedge. Re-hedge by buying shares at the lower price — lock in profit.' },
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
          <div className="info-box" style={{ marginTop: 12 }}>
            <strong>The catch:</strong> You pay theta (time decay) every day for this gamma.
            Gamma scalping is profitable only if realized volatility exceeds the implied volatility 
            you paid when buying the option. This is the fundamental bet in long vol strategies.
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 12 }}>Why Perfect Hedging is Impossible</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
            Even with continuous delta hedging, residual risks remain:
          </p>
          {[
            { risk: 'Gamma risk', desc: 'Large discrete jumps cannot be hedged by delta alone.' },
            { risk: 'Vega risk', desc: 'Implied volatility changes affect option value but not the delta hedge.' },
            { risk: 'Gap risk', desc: 'Markets can jump overnight or on news — the hedge may be wrong.' },
            { risk: 'Model risk', desc: 'Black-Scholes assumes constant vol and log-normal returns — both wrong.' },
            { risk: 'Transaction costs', desc: 'Continuous rebalancing is impractical due to bid-ask spreads.' },
          ].map(item => (
            <div key={item.risk} style={{
              display: 'flex', gap: 12, padding: '8px 0',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--accent)', minWidth: 120 }}>{item.risk}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 8. Real World Applications ── */}
      <Section number={8} title="Real World Applications">
        <div className="grid-2" style={{ gap: 16 }}>
          {[
            {
              title: 'Investment Banks',
              items: [
                { label: 'Structured products', desc: 'Create capital-protected notes for retail investors by combining bonds + options.' },
                { label: 'Client hedging', desc: 'Help corporate clients hedge FX, rates, and commodity exposure using tailored derivatives.' },
                { label: 'Market making', desc: 'Quote bid/ask prices for options, delta-hedge the risk, profit from the spread.' },
                { label: 'Proprietary trading', desc: 'Take directional views on vol, rates, and credit using derivatives.' },
              ]
            },
            {
              title: 'Hedge Funds',
              items: [
                { label: 'Long/short vol', desc: 'Buy realized vol (long gamma) vs selling implied vol (short vega) to capture the variance risk premium.' },
                { label: 'Tail risk hedging', desc: 'Buy deep OTM puts as insurance against market crashes — pays off massively in crises.' },
                { label: 'Merger arbitrage', desc: 'Buy call spreads on acquisition targets to profit from deal completion with defined risk.' },
                { label: 'Macro directional', desc: 'Use options to express macro views (e.g. buy USD calls if expecting Fed to hike).' },
              ]
            },
            {
              title: 'Airlines & Commodities',
              items: [
                { label: 'Fuel hedging', desc: 'Airlines buy oil call options or futures to cap fuel costs. Southwest Airlines famous for hedging 80%+ of fuel needs.' },
                { label: 'Revenue hedging', desc: 'Gold miners sell forward contracts to lock in gold prices and secure project financing.' },
                { label: 'Agricultural', desc: 'Farmers sell futures to lock in crop prices before harvest. Food companies buy futures to lock in input costs.' },
              ]
            },
            {
              title: 'Corporations',
              items: [
                { label: 'FX hedging', desc: 'Apple earns revenue in 40+ currencies. Buys FX forwards and options to reduce earnings volatility from currency moves.' },
                { label: 'Interest rate hedging', desc: 'Companies with floating-rate debt buy interest rate caps or enter pay-fixed swaps to protect against rate rises.' },
                { label: 'Employee stock options', desc: 'Tech companies grant call options to employees as compensation. Banks hedge this exposure.' },
              ]
            },
          ].map(section => (
            <div key={section.title} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '14px 16px',
            }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>{section.title}</div>
              {section.items.map(item => (
                <div key={item.label} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--accent)', marginBottom: 2 }}>{item.label}</div>
                  <p style={{ fontSize: 12, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
}