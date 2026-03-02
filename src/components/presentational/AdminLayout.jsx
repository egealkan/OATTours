import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import AdminNavbar from './AdminNavbar';
import SharedFooter from './SharedFooter';
import '../../index.css'; // Make sure you have this for the flex-wrapper we discussed

const AdminLayout = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check if the admin is already logged in when they hit an admin route
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };
        
        checkSession();

        // 2. Listen for login/logout events (so the layout updates immediately)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Show a blank screen or a spinner while checking the database
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>Loading Admin...</div>;
    }

    // THE GUARD: If there is no session, redirect to the login page immediately
    if (!session) {
        return <Navigate to="/admin/login" replace />;
    }

    // THE LAYOUT: If they are logged in, show the unified layout with the actual page content (<Outlet />)
    return (
        <div className="layout-wrapper">
            <AdminNavbar />
            <main className="layout-content">
                <Outlet />
            </main>
            <SharedFooter role="admin" />
        </div>
    );
};

export default AdminLayout;