import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient'; 
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

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

    return (
        <div className="admin-dashboard-wrapper">
            {/* <header className="dashboard-header">
                <h1>Tour Management Hub</h1>
                <button onClick={handleLogout} className="logout-button">
                    Secure Logout
                </button>
            </header> */}

            <p className="dashboard-intro">
                Select a module below to manage the content your guests will see.
            </p>

            <div className="dashboard-grid">
                <Link to="/admin/edit-welcome-email" className="dashboard-card">
                    <h2 className="card-title">Pre-Trip/Welcome Email</h2>
                    <p className="card-description">
                        Manage pre-tour instructions, meeting points, transfer details, and essential pre-arrival information.
                    </p>
                </Link>

                <Link to="/admin/edit-welcome-meeting" className="dashboard-card">
                    <h2 className="card-title">Welcome Meeting</h2>
                    <p className="card-description">
                        Edit visual aids, rules, comprehensive itineraries, and presentations used during the Day 1 orientation.
                    </p>
                </Link>

                <Link to="/admin/edit-tour" className="dashboard-card">
                    <h2 className="card-title">Daily Itinerary</h2>
                    <p className="card-description">
                        Add, edit, or remove daily schedules, hotel information, meal plans, and interactive maps.
                    </p>
                </Link>

                <Link to="/admin/edit-farewell" className="dashboard-card">
                    <h2 className="card-title">Farewell Page</h2>
                    <p className="card-description">
                        Update departure logistics, tipping guidelines, feedback forms, and closing remarks.
                    </p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;