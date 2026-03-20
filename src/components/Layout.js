// src/components/Layout.js
// Main layout wrapper — sidebar + content area

import React from 'react';
import Sidebar from './Sidebar';
import '../styles/global.css';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}