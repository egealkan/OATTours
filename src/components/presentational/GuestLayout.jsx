import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import GuestNavbar from './GuestNavbar';
import SharedFooter from './SharedFooter';
import '../../index.css';

const GuestLayout = () => {
    // Check if the user has successfully entered the PIN
    const isAuthenticated = sessionStorage.getItem('guestAuthenticated') === 'true';

    // THE GUARD: If not authenticated, bounce them to the login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // THE LAYOUT: If authenticated, show the navbar, content, and footer
    return (
        <div className="layout-wrapper">
            <GuestNavbar />
            <main className="layout-content">
                <Outlet />
            </main>
            <SharedFooter role="guest" />
        </div>
    );
};

export default GuestLayout;