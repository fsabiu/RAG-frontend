import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg" alt="Oracle Consulting" className="oracle-logo" />
          </Link>
        </div>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/config" className="nav-link">Config</Link>
          <Link to="/chat" className="nav-link">Chat</Link>
        </nav>
        <div className="header-right">
          <button className="sign-in-button">Sign in</button>
        </div>
      </div>
    </header>
  );
}

export default Header;
