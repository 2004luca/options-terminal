// src/App.js
// Root component — sets up routing between pages

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import OptionsPricer from './pages/OptionsPricer';
import StrategyPlayground from './pages/StrategyPlayground';
import PDESolver from './pages/PDESolver';
import VolSurface from './pages/VolSurface';
import OptionsChain from './pages/OptionsChain';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"         element={<OptionsPricer />} />
          <Route path="/strategy" element={<StrategyPlayground />} />
          <Route path="/pde"      element={<PDESolver />} />
          <Route path="/surface"  element={<VolSurface />} />
          <Route path="/chain"    element={<OptionsChain />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}