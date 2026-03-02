import React from 'react';
import { Link } from 'react-router-dom';
import './GuestNavbar.css';

const GuestNavbar = () => {
    return (
        <nav className="guest-navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    OAT Tours Turkey
                </Link>
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Welcome</Link>
                    {/* We will map day links here later */}
                </div>
            </div>
        </nav>
    );
};

export default GuestNavbar;