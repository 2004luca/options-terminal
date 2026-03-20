// src/utils/blackscholes.js
// Black-Scholes pricing model and Greeks
// All the financial math lives here — imported by other components

import * as math from 'mathjs';

// ─── Normal Distribution ───────────────────────────────────────────────────

/**
 * Cumulative Normal Distribution Function N(x)
 * Uses the Horner's method approximation — accurate to 7 decimal places
 * This is the probability that a standard normal variable is <= x
 */
export function normalCDF(x) {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Standard Normal Probability Density Function N'(x)
 * Used in Greeks calculations
 */
export function normalPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// ─── d1 and d2 ─────────────────────────────────────────────────────────────

/**
 * Calculates d1 and d2 — the core of Black-Scholes
 * 
 * d1 = [ln(S/K) + (r - q + σ²/2)·T] / (σ·√T)
 * d2 = d1 - σ·√T
 * 
 * @param {number} S - Current stock price
 * @param {number} K - Strike price
 * @param {number} T - Time to expiry in years
 * @param {number} r - Risk-free rate (decimal, e.g. 0.05 for 5%)
 * @param {number} sigma - Volatility (decimal, e.g. 0.2 for 20%)
 * @param {number} q - Dividend yield (decimal, default 0)
 */
export function calcD1D2(S, K, T, r, sigma, q = 0) {
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return { d1, d2 };
}

// ─── Option Price ───────────────────────────────────────────────────────────

/**
 * Black-Scholes option price
 * 
 * Call: C = S·e^(-qT)·N(d1) - K·e^(-rT)·N(d2)
 * Put:  P = K·e^(-rT)·N(-d2) - S·e^(-qT)·N(-d1)
 * 
 * @param {string} type - 'call' or 'put'
 * @returns {number} Option price
 */
export function blackScholes(S, K, T, r, sigma, q = 0, type = 'call') {
  if (T <= 0) {
    // At expiry — intrinsic value only
    return type === 'call'
      ? Math.max(S - K, 0)
      : Math.max(K - S, 0);
  }

  const { d1, d2 } = calcD1D2(S, K, T, r, sigma, q);

  if (type === 'call') {
    return S * Math.exp(-q * T) * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  } else {
    return K * Math.exp(-r * T) * normalCDF(-d2) - S * Math.exp(-q * T) * normalCDF(-d1);
  }
}

// ─── Greeks ────────────────────────────────────────────────────────────────

/**
 * Calculates all 5 Greeks for an option
 * 
 * DELTA — sensitivity of option price to spot price change
 *   Call: N(d1)    Put: N(d1) - 1
 *   Interpretation: if delta = 0.6, option price moves $0.60 for every $1 move in stock
 * 
 * GAMMA — rate of change of delta (second derivative of price)
 *   Same for calls and puts: N'(d1) / (S·σ·√T)
 *   Interpretation: how much delta changes for every $1 move in stock
 * 
 * VEGA — sensitivity to volatility change
 *   Same for calls and puts: S·e^(-qT)·N'(d1)·√T
 *   Interpretation: option price change for 1% change in volatility
 * 
 * THETA — time decay (daily)
 *   Interpretation: option price change per day as time passes
 *   Almost always negative — options lose value as time passes
 * 
 * RHO — sensitivity to interest rate change
 *   Call: K·T·e^(-rT)·N(d2)
 *   Put:  -K·T·e^(-rT)·N(-d2)
 *   Interpretation: option price change for 1% change in rates
 */
export function calcGreeks(S, K, T, r, sigma, q = 0, type = 'call') {
  if (T <= 0) {
    return { delta: type === 'call' ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, vega: 0, theta: 0, rho: 0 };
  }

  const { d1, d2 } = calcD1D2(S, K, T, r, sigma, q);
  const sqrtT = Math.sqrt(T);
  const eqT   = Math.exp(-q * T);
  const erT   = Math.exp(-r * T);

  // Delta
  const delta = type === 'call'
    ? eqT * normalCDF(d1)
    : eqT * (normalCDF(d1) - 1);

  // Gamma (same for calls and puts)
  const gamma = eqT * normalPDF(d1) / (S * sigma * sqrtT);

  // Vega (divided by 100 to express per 1% vol change)
  const vega = S * eqT * normalPDF(d1) * sqrtT / 100;

  // Theta (divided by 365 for daily decay)
  const thetaCall = (
    -(S * eqT * normalPDF(d1) * sigma) / (2 * sqrtT)
    - r * K * erT * normalCDF(d2)
    + q * S * eqT * normalCDF(d1)
  ) / 365;

  const thetaPut = (
    -(S * eqT * normalPDF(d1) * sigma) / (2 * sqrtT)
    + r * K * erT * normalCDF(-d2)
    - q * S * eqT * normalCDF(-d1)
  ) / 365;

  const theta = type === 'call' ? thetaCall : thetaPut;

  // Rho (divided by 100 to express per 1% rate change)
  const rho = type === 'call'
    ? K * T * erT * normalCDF(d2) / 100
    : -K * T * erT * normalCDF(-d2) / 100;

  return { delta, gamma, vega, theta, rho };
}

// ─── Implied Volatility ─────────────────────────────────────────────────────

/**
 * Calculates implied volatility using Newton-Raphson iteration
 * 
 * Given a market price, finds the volatility that makes BS price = market price
 * This is what the market is "implying" about future volatility
 * 
 * @param {number} marketPrice - Observed market price of the option
 * @returns {number} Implied volatility (decimal)
 */
export function impliedVolatility(marketPrice, S, K, T, r, q = 0, type = 'call') {
  let sigma = 0.2; // initial guess
  const maxIter = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIter; i++) {
    const price = blackScholes(S, K, T, r, sigma, q, type);
    const vega  = calcGreeks(S, K, T, r, sigma, q, type).vega * 100; // un-scale vega

    const diff = price - marketPrice;
    if (Math.abs(diff) < tolerance) break;
    if (Math.abs(vega) < 1e-10) break;

    sigma = sigma - diff / vega;
    if (sigma <= 0) sigma = 0.001;
  }

  return sigma;
}