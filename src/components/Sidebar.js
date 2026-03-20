// src/components/Sidebar.js
// Navigation sidebar — links to all pages

import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/sidebar.css';

const navItems = [
  {
    section: 'Pricing',
    items: [
      { path: '/',        icon: '⚡', label: 'Options Pricer',      badge: 'BS + PDE' },
      { path: '/strategy', icon: '📊', label: 'Strategy Playground', badge: null },
    ]
  },
  {
    section: 'Advanced',
    items: [
      { path: '/pde',      icon: '🔢', label: 'PDE Solver',         badge: '3D' },
      { path: '/surface',  icon: '🌐', label: 'Vol Surface',        badge: 'Live' },
      { path: '/chain',    icon: '📋', label: 'Options Chain',      badge: 'Live' },
    ]
  }
];

export default function Sidebar({ activePage }) {
  return (
    <aside className="sidebar">

      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          Options<span>Lab</span>
        </div>
        <div className="sidebar-subtitle">Analytics Terminal</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          Built with React & Black-Scholes<br />
          Data via Yahoo Finance
        </div>
      </div>

    </aside>
  );
}