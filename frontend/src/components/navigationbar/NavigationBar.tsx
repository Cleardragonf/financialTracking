// src/navigationbar/NavigationBar.tsx
import React from 'react';
import './NavigationBar.css';

export const NavigationBar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">MyApp</a>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <a href="/" className="navbar-link">Home</a>
          </li>
          <li className="navbar-item">
            <a href="/transactions" className="navbar-link">Transactions</a>
          </li>
          <li className="navbar-item">
            <a href="/Calander" className="navbar-link">Calander</a>
          </li>
          <li className="navbar-item">
            <a href="/contact" className="navbar-link">Contact</a>
          </li>
          <li className='navbar-item'>
            <a href='/ROD' className='navbar-link'>Records of Debt</a>
          </li>
        </ul>
      </div>
    </nav>
  );
};