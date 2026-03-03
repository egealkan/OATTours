import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './GuestNavbar.css';

const GuestNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="guest-navbar">
            <div className="navbar-container">
                
                <div className="navbar-brand">
                    <NavLink to="/" className="navbar-logo-container" onClick={closeMenu}>
                        {/* Make sure your logo is in the public folder or adjust this path */}
                        <img src="/oat.png" alt="OAT Logo" className="navbar-logo-img" />
                        <span className="navbar-logo-text">OAT Tours Turkey</span>
                    </NavLink>
                    
                    {/* Hamburger Button */}
                    <button 
                        className="mobile-menu-toggle" 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                <div className={`navbar-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div className="navbar-links">
                        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu} end>
                            Home
                        </NavLink>
                        
                        <NavLink to="/welcome-email" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu} end>
                            Pre-Trip Info
                        </NavLink>

                        <NavLink to="/welcome-meeting" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Welcome Meeting
                        </NavLink>
                        
                        <NavLink to="/daily-info" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Daily Itinerary
                        </NavLink>
                        
                        <NavLink to="/farewell" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Farewell
                        </NavLink>
                    </div>
                </div>

            </div>
        </nav>
    );
};

export default GuestNavbar;