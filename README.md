# Options Terminal

An interactive options analytics platform built with React — covering derivatives pricing, strategy analysis, PDE solving, and volatility surface modeling.

Live: [options-terminal.vercel.app](https://options-terminal.vercel.app)

---

## Overview

Options Terminal is an educational and analytical tool for understanding derivatives and options markets. It combines rigorous financial mathematics with interactive visualizations — from Black-Scholes pricing to finite difference PDE solvers.

Every page includes both the tool and the theory behind it — explaining not just what the numbers are, but why they matter and how they are used in practice.

---

## Pages

| Page | Description |
|------|-------------|
| **Derivatives 101** | Complete guide to derivatives — forwards, futures, swaps, options, Black-Scholes derivation from stochastic calculus, Greeks, hedging, and real-world applications |
| **Options Pricer** | Black-Scholes analytical pricing with real-time Greeks, sensitivity analysis, and expandable theory panel |
| **Strategy Playground** | P&L diagrams for 10 common strategies — Long Call, Straddle, Iron Condor, Butterfly and more — with breakeven, max profit/loss, and strategy guide |
| **PDE Solver** | Finite Difference Method solver for the Black-Scholes PDE — Explicit, Implicit, and Crank-Nicolson schemes with 3D surface and residual error visualization |
| **Vol Surface** | Implied volatility surface using SVI parametrization — 3D surface, vol smile by maturity, and term structure analysis |
| **Options Chain** | Real-world style options chain with Black-Scholes pricing, Greeks toggle, bid/ask spreads, open interest, and volume |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **React** | Frontend framework |
| **JavaScript** | Core language — all financial math implemented from scratch |
| **Plotly.js** | Interactive 3D charts and surface plots |
| **CSS Variables** | Design system — light mode professional theme |
| **Vercel** | Deployment and hosting |

---

## Financial Mathematics

All pricing and risk calculations are implemented from scratch in JavaScript — no external financial libraries:

- **Black-Scholes formula** — analytical option pricing for calls and puts
- **Greeks** — Delta, Gamma, Vega, Theta, Rho with full derivations
- **Implied Volatility** — Newton-Raphson inversion of the BS formula
- **Finite Difference Method** — three numerical schemes for the BS PDE
  - Explicit (conditionally stable)
  - Implicit (unconditionally stable, Thomas algorithm)
  - Crank-Nicolson (second-order accurate, industry standard)
- **SVI Volatility Surface** — parametric model for realistic vol surface generation

---

## Running Locally
```bash
git clone https://github.com/2004luca/options-terminal.git
cd options-terminal
npm install
npm start
```

Opens at `http://localhost:3000`

---

## What I Learned

### Financial Theory
- Derivation of Black-Scholes from Geometric Brownian Motion and Ito's Lemma
- How Greeks measure and manage option risk in practice
- The mechanics of delta hedging and gamma scalping
- Why the volatility surface exists and what it tells us about market expectations
- How finite difference methods solve PDEs numerically
- Real-world use of derivatives by banks, hedge funds, and corporations

### Engineering
- Building a multi-page React application from scratch
- Implementing numerical algorithms (Newton-Raphson, Thomas algorithm, FDM) in JavaScript
- Creating interactive SVG charts without external charting libraries
- Designing a consistent component system with CSS variables

---

## Disclaimer

This project is for educational purposes only. Nothing here constitutes financial advice.