import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import './GuestNavbar.css';

const GuestNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // Default true so the link doesn't flash-disappear if post-trip is enabled
    const [showPostTrip, setShowPostTrip] = useState(true);

    useEffect(() => {
        const fetchPostTripSetting = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('show_post_trip')
                    .eq('id', 1)
                    .single();

                if (data) {
                    // treat null as true (default on)
                    setShowPostTrip(data.show_post_trip !== false);
                }
            } catch (err) {
                // on error keep the default (true)
                console.error('Could not load post-trip setting:', err);
            }
        };

        fetchPostTripSetting();
    }, []);

    const closeMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="guest-navbar">
            <div className="navbar-container">

                <div className="navbar-brand">
                    <NavLink to="/" className="navbar-logo-container" onClick={closeMenu}>
                        <img src="/oat.png" alt="OAT Logo" className="navbar-logo-img" />
                        <span className="navbar-logo-text">OAT Tours Turkey</span>
                    </NavLink>

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
                        <NavLink
                            to="/"
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            onClick={closeMenu}
                            end
                        >
                            Home
                        </NavLink>

                        <NavLink
                            to="/welcome-email"
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            onClick={closeMenu}
                            end
                        >
                            Pre-Trip Info
                        </NavLink>

                        <NavLink
                            to="/welcome-meeting"
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            onClick={closeMenu}
                        >
                            Welcome Meeting
                        </NavLink>

                        <NavLink
                            to="/daily-info"
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            onClick={closeMenu}
                        >
                            Daily Itinerary
                        </NavLink>

                        <NavLink
                            to="/farewell"
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            onClick={closeMenu}
                        >
                            Farewell
                        </NavLink>

                        {showPostTrip && (
                            <NavLink
                                to="/post-trip"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                onClick={closeMenu}
                            >
                                Post Trip
                            </NavLink>
                        )}
                    </div>
                </div>

            </div>
        </nav>
    );
};

export default GuestNavbar;








// import React, { useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import './GuestNavbar.css';

// const GuestNavbar = () => {
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//     const closeMenu = () => {
//         setIsMobileMenuOpen(false);
//     };

//     return (
//         <nav className="guest-navbar">
//             <div className="navbar-container">
                
//                 <div className="navbar-brand">
//                     <NavLink to="/" className="navbar-logo-container" onClick={closeMenu}>
//                         {/* Make sure your logo is in the public folder or adjust this path */}
//                         <img src="/oat.png" alt="OAT Logo" className="navbar-logo-img" />
//                         <span className="navbar-logo-text">OAT Tours Turkey</span>
//                     </NavLink>
                    
//                     {/* Hamburger Button */}
//                     <button 
//                         className="mobile-menu-toggle" 
//                         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                         aria-label="Toggle menu"
//                     >
//                         {isMobileMenuOpen ? '✕' : '☰'}
//                     </button>
//                 </div>

//                 <div className={`navbar-menu ${isMobileMenuOpen ? 'open' : ''}`}>
//                     <div className="navbar-links">
//                         <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu} end>
//                             Home
//                         </NavLink>
                        
//                         <NavLink to="/welcome-email" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu} end>
//                             Pre-Trip Info
//                         </NavLink>

//                         <NavLink to="/welcome-meeting" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
//                             Welcome Meeting
//                         </NavLink>
                        
//                         <NavLink to="/daily-info" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
//                             Daily Itinerary
//                         </NavLink>
                        
//                         <NavLink to="/farewell" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
//                             Farewell
//                         </NavLink>
//                         <NavLink to="/post-trip" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
//                             Post Trip
//                         </NavLink>
//                     </div>
//                 </div>

//             </div>
//         </nav>
//     );
// };

// export default GuestNavbar;