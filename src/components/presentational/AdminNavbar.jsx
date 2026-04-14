import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import './AdminNavbar.css';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/admin/login');
        } catch (error) {
            console.error('Error logging out:', error.message);
            alert('Failed to log out. Please try again.');
        }
    };

    const closeMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="admin-navbar">
            <div className="navbar-container">
                
                <div className="navbar-brand">
                    <NavLink to="/admin" className="navbar-title" onClick={closeMenu} end>
                        Admin
                    </NavLink>
                    
                    {/* Hamburger Button (Only visible on mobile) */}
                    <button 
                        className="mobile-menu-toggle" 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* The Navigation Links & Logout */}
                <div className={`navbar-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div className="navbar-links">
                        <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu} end>
                            Dashboard
                        </NavLink>
                        <NavLink to="/admin/edit-welcome-email" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Welcome Email
                        </NavLink>
                        <NavLink to="/admin/edit-welcome-meeting" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Welcome Meeting
                        </NavLink>
                        <NavLink to="/admin/edit-daily-info" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Daily Info
                        </NavLink>
                        <NavLink to="/admin/edit-farewell" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Farewell
                        </NavLink>
                        <NavLink to="/admin/calendar" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Calendar
                        </NavLink>
                        <NavLink to="/admin/edit-post-trip" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Post Trip
                        </NavLink>
                    </div>

                    <button onClick={handleLogout} className="logout-button">
                        Secure Logout
                    </button>
                </div>

            </div>
        </nav>
    );
};

export default AdminNavbar;