// src/utils/pde.js
// Finite Difference Method (FDM) solver for the Black-Scholes PDE
//
// The Black-Scholes PDE:
// ∂V/∂t + ½σ²S²·∂²V/∂S² + (r-q)S·∂V/∂S - rV = 0
//
// We solve this numerically on a grid of S (spot) and t (time) values
// Three schemes: Explicit, Implicit, Crank-Nicolson

import { blackScholes } from './blackscholes';

// ─── Grid Setup ─────────────────────────────────────────────────────────────

/**
 * Creates the spatial grid of stock prices
 * @param {number} Smax - Maximum stock price on grid
 * @param {number} NS   - Number of spatial steps
 * @returns {number[]} Array of stock prices from 0 to Smax
 */
function createSGrid(Smax, NS) {
  const dS = Smax / NS;
  return Array.from({ length: NS + 1 }, (_, i) => i * dS);
}

/**
 * Terminal condition — option payoff at expiry T
 * Call: max(S - K, 0)
 * Put:  max(K - S, 0)
 */
function terminalCondition(S, K, type) {
  return S.map(s =>
    type === 'call' ? Math.max(s - K, 0) : Math.max(K - s, 0)
  );
}

/**
 * Boundary conditions at each time step
 * 
 * For a Call:
 *   V(0, t) = 0           (worthless when S=0)
 *   V(Smax, t) = Smax - K·e^(-r(T-t))  (deep ITM approximation)
 * 
 * For a Put:
 *   V(0, t) = K·e^(-r(T-t))  (deep ITM approximation)
 *   V(Smax, t) = 0            (worthless when S is very high)
 */
function boundaryConditions(Smax, K, r, tau, type) {
  if (type === 'call') {
    return {
      lower: 0,
      upper: Math.max(Smax - K * Math.exp(-r * tau), 0)
    };
  } else {
    return {
      lower: K * Math.exp(-r * tau),
      upper: 0
    };
  }
}

// ─── Thomas Algorithm ───────────────────────────────────────────────────────

/**
 * Solves a tridiagonal system Ax = d using the Thomas algorithm
 * Used in Implicit and Crank-Nicolson schemes
 * Much faster than full matrix inversion — O(n) complexity
 * 
 * @param {number[]} a - Lower diagonal
 * @param {number[]} b - Main diagonal  
 * @param {number[]} c - Upper diagonal
 * @param {number[]} d - Right hand side
 * @returns {number[]} Solution vector x
 */
function thomasAlgorithm(a, b, c, d) {
  const n = d.length;
  const cPrime = new Array(n).fill(0);
  const dPrime = new Array(n).fill(0);
  const x = new Array(n).fill(0);

  // Forward sweep
  cPrime[0] = c[0] / b[0];
  dPrime[0] = d[0] / b[0];

  for (let i = 1; i < n; i++) {
    const m = b[i] - a[i] * cPrime[i - 1];
    cPrime[i] = c[i] / m;
    dPrime[i] = (d[i] - a[i] * dPrime[i - 1]) / m;
  }

  // Back substitution
  x[n - 1] = dPrime[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    x[i] = dPrime[i] - cPrime[i] * x[i + 1];
  }

  return x;
}

// ─── Explicit Scheme ─────────────────────────────────────────────────────────

/**
 * Explicit Finite Difference Method
 * 
 * Simple but conditionally stable — requires small time steps
 * Stability condition: dt <= dS² / (sigma² * Smax²)
 * 
 * At each time step, new values are calculated directly from old values
 * No matrix solve required — explicit formula
 */
function solveExplicit(S, K, T, r, sigma, q, NS, NT, type) {
  const Smax = S[S.length - 1];
  const dS = Smax / NS;
  const dt = T / NT;

  // Check stability
  const stable = dt <= (dS * dS) / (sigma * sigma * Smax * Smax);

  // Initialize with terminal condition
  let V = terminalCondition(S, K, type);

  // Time stepping backwards from T to 0
  for (let j = NT - 1; j >= 0; j--) {
    const tau = (NT - j) * dt; // time to expiry
    const newV = [...V];

    for (let i = 1; i < NS; i++) {
      //const Si = S[i];
      const alpha = 0.5 * dt * (sigma * sigma * i * i - (r - q) * i);
      const beta  = 1 - dt * (sigma * sigma * i * i + r);
      const gamma = 0.5 * dt * (sigma * sigma * i * i + (r - q) * i);

      newV[i] = alpha * V[i - 1] + beta * V[i] + gamma * V[i + 1];
    }

    // Apply boundary conditions
    const bc = boundaryConditions(Smax, K, r, tau, type);
    newV[0]  = bc.lower;
    newV[NS] = bc.upper;

    V = newV;
  }

  return { V, stable };
}

// ─── Implicit Scheme ─────────────────────────────────────────────────────────

/**
 * Implicit Finite Difference Method
 * 
 * Unconditionally stable — can use larger time steps
 * Requires solving a tridiagonal system at each time step
 * Less accurate than Crank-Nicolson for same step size
 */
function solveImplicit(S, K, T, r, sigma, q, NS, NT, type) {
  //const Smax = S[S.length - 1];
  const dS = Smax / NS;
  const dt = T / NT;

  let V = terminalCondition(S, K, type);

  for (let j = NT - 1; j >= 0; j--) {
    const tau = (NT - j) * dt;

    const a = new Array(NS - 1).fill(0);
    const b = new Array(NS - 1).fill(0);
    const c = new Array(NS - 1).fill(0);
    const d = new Array(NS - 1).fill(0);

    for (let i = 1; i < NS; i++) {
      const idx = i - 1;
      a[idx] = -0.5 * dt * (sigma * sigma * i * i - (r - q) * i);
      b[idx] =  1 + dt * (sigma * sigma * i * i + r);
      c[idx] = -0.5 * dt * (sigma * sigma * i * i + (r - q) * i);
      d[idx] = V[i];
    }

    const bc = boundaryConditions(Smax, K, r, tau, type);
    d[0]        -= a[0] * bc.lower;
    d[NS - 2]   -= c[NS - 2] * bc.upper;

    const interior = thomasAlgorithm(a, b, c, d);

    const newV = [...V];
    newV[0]  = bc.lower;
    newV[NS] = bc.upper;
    for (let i = 1; i < NS; i++) {
      newV[i] = interior[i - 1];
    }

    V = newV;
  }

  return { V, stable: true };
}

// ─── Crank-Nicolson Scheme ───────────────────────────────────────────────────

/**
 * Crank-Nicolson Finite Difference Method
 * 
 * The gold standard — unconditionally stable AND second-order accurate
 * Averages the explicit and implicit schemes (theta = 0.5)
 * Most commonly used in practice for option pricing
 */
function solveCrankNicolson(S, K, T, r, sigma, q, NS, NT, type) {
  const Smax = S[S.length - 1];
  const dt = T / NT;

  let V = terminalCondition(S, K, type);

  for (let j = NT - 1; j >= 0; j--) {
    const tau = (NT - j) * dt;

    const a = new Array(NS - 1).fill(0);
    const b = new Array(NS - 1).fill(0);
    const c = new Array(NS - 1).fill(0);
    const d = new Array(NS - 1).fill(0);

    for (let i = 1; i < NS; i++) {
      const idx = i - 1;
      const alpha = 0.25 * dt * (sigma * sigma * i * i - (r - q) * i);
      const beta  = 0.5  * dt * (sigma * sigma * i * i + r);
      const gamma = 0.25 * dt * (sigma * sigma * i * i + (r - q) * i);

      a[idx] = -alpha;
      b[idx] =  1 + beta;
      c[idx] = -gamma;
      d[idx] =  alpha * V[i - 1] + (1 - beta) * V[i] + gamma * V[i + 1];
    }

    const bc = boundaryConditions(Smax, K, r, tau, type);
    d[0]      -= a[0] * bc.lower;
    d[NS - 2] -= c[NS - 2] * bc.upper;

    const interior = thomasAlgorithm(a, b, c, d);

    const newV = [...V];
    newV[0]  = bc.lower;
    newV[NS] = bc.upper;
    for (let i = 1; i < NS; i++) {
      newV[i] = interior[i - 1];
    }

    V = newV;
  }

  return { V, stable: true };
}

// ─── Main Solver ─────────────────────────────────────────────────────────────

/**
 * Main PDE solver — dispatches to the correct scheme
 * Also computes the analytical Black-Scholes solution for comparison
 * 
 * @param {string} scheme - 'explicit', 'implicit', or 'crankNicolson'
 * @returns {object} { S, V_numerical, V_analytical, residual, stable }
 */
export function solvePDE(S0, K, T, r, sigma, q = 0, type = 'call', scheme = 'crankNicolson', NS = 100, NT = 100, Smax = null) {
  if (!Smax) Smax = 3 * Math.max(S0, K);

  const S = createSGrid(Smax, NS);

  let result;
  if (scheme === 'explicit') {
    result = solveExplicit(S, K, T, r, sigma, q, NS, NT, type);
  } else if (scheme === 'implicit') {
    result = solveImplicit(S, K, T, r, sigma, q, NS, NT, type);
  } else {
    result = solveCrankNicolson(S, K, T, r, sigma, q, NS, NT, type);
  }

  // Analytical solution for comparison
  const V_analytical = S.map(s => blackScholes(s, K, T, r, sigma, q, type));

  // Residual error
  const residual = result.V.map((v, i) => v - V_analytical[i]);

  return {
    S,
    V_numerical:  result.V,
    V_analytical,
    residual,
    stable: result.stable,
  };
}