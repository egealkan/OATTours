// import React from 'react';
// import { Link } from 'react-router-dom';
// import './GuestNavbar.css';

// const GuestNavbar = () => {
//     return (
//         <nav className="guest-navbar">
//             <div className="navbar-container">
//                 <Link to="/" className="navbar-logo">
//                     OAT Tours Turkey
//                 </Link>
//                 <div className="navbar-links">
//                     <Link to="/" className="nav-link">Welcome</Link>
//                     {/* We will map day links here later */}
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default GuestNavbar;








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
                    <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
                        OAT Tours Turkey
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
                            Welcome
                        </NavLink>
                        {/* We will map dynamic daily itinerary links here later */}
                    </div>
                </div>

            </div>
        </nav>
    );
};

export default GuestNavbar;