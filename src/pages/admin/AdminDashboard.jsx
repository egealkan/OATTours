// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { supabase } from '../../services/supabaseClient'; 
// import './AdminDashboard.css';

// const AdminDashboard = () => {
//     const navigate = useNavigate();

//     const handleLogout = async () => {
//         try {
//             const { error } = await supabase.auth.signOut();
//             if (error) throw error;
//             navigate('/admin/login');
//         } catch (error) {
//             console.error('Error logging out:', error.message);
//             alert('Failed to log out. Please try again.');
//         }
//     };

//     return (
//         <div className="admin-dashboard-wrapper">
//             {/* <header className="dashboard-header">
//                 <h1>Tour Management Hub</h1>
//                 <button onClick={handleLogout} className="logout-button">
//                     Secure Logout
//                 </button>
//             </header> */}

//             <p className="dashboard-intro">
//                 Select a module below to manage the content your guests will see.
//             </p>

//             <div className="dashboard-grid">
//                 <Link to="/admin/edit-welcome-email" className="dashboard-card">
//                     <h2 className="card-title">Pre-Trip/Welcome Email</h2>
//                     <p className="card-description">
//                         Manage pre-tour instructions, meeting points, transfer details, and essential pre-arrival information.
//                     </p>
//                 </Link>

//                 <Link to="/admin/edit-welcome-meeting" className="dashboard-card">
//                     <h2 className="card-title">Welcome Meeting</h2>
//                     <p className="card-description">
//                         Edit visual aids, rules, comprehensive itineraries, and presentations used during the Day 1 orientation.
//                     </p>
//                 </Link>

//                 <Link to="/admin/edit-daily-info" className="dashboard-card">
//                     <h2 className="card-title">Daily Itinerary</h2>
//                     <p className="card-description">
//                         Add, edit, or remove daily schedules, hotel information, meal plans, and interactive maps.
//                     </p>
//                 </Link>

//                 <Link to="/admin/edit-farewell" className="dashboard-card">
//                     <h2 className="card-title">Farewell Page</h2>
//                     <p className="card-description">
//                         Update departure logistics, tipping guidelines, feedback forms, and closing remarks.
//                     </p>
//                 </Link>
//             </div>
//         </div>
//     );
// };

// export default AdminDashboard;



import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [passcode, setPasscode] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            // We fetch the row with ID 1 from the settings table
            const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
            if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error initially
            
            if (data) {
                setPasscode(data.guest_passcode || '');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePasscode = async (e) => {
        e.preventDefault();
        
        if (passcode.length !== 4) {
            toast.error('Passcode must be exactly 4 digits.');
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading('Updating Passcode...');

        try {
            // Upsert will update row ID 1 if it exists, or create it if it doesn't
            const { error } = await supabase.from('settings').upsert({ 
                id: 1, 
                guest_passcode: passcode 
            }, { onConflict: 'id' });
            
            if (error) throw error;
            
            toast.success('Passcode changed successfully!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Failed to change passcode.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasscodeChange = (e) => {
        // Only allow numbers, max 4 digits
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setPasscode(value);
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '10vh' }}>Loading Dashboard...</div>;

    return (
        <div className="admin-dashboard-wrapper">
            <div className="admin-dashboard-header">
                <h1>Admin Control Center</h1>
                <p>Manage your tour data, itineraries, and guest access settings.</p>
            </div>

            <div className="dashboard-grid">
                
                {/* --- QUICK LINKS CARD --- */}
                <div className="dashboard-card quick-links-card">
                    <h2>Tour Management</h2>
                    <p>Select a section to edit your current active tour.</p>
                    
                    <div className="links-container">
                        <Link to="/admin/edit-welcome-email" className="dashboard-link">
                            <span className="link-icon">📧</span>
                            <div className="link-text">
                                <strong>Welcome Email</strong>
                                <span>Climate, Transfers & Contacts</span>
                            </div>
                        </Link>
                        
                        <Link to="/admin/edit-welcome-meeting" className="dashboard-link">
                            <span className="link-icon">🤝</span>
                            <div className="link-text">
                                <strong>Welcome Meeting</strong>
                                <span>Guide Profile, Hotels & Flights</span>
                            </div>
                        </Link>
                        
                        <Link to="/admin/edit-daily-info" className="dashboard-link">
                            <span className="link-icon">🗺️</span>
                            <div className="link-text">
                                <strong>Daily Itineraries</strong>
                                <span>Day-by-Day Places & Schedules</span>
                            </div>
                        </Link>
                        
                        <Link to="/admin/edit-farewell" className="dashboard-link">
                            <span className="link-icon">👋</span>
                            <div className="link-text">
                                <strong>Farewell Page</strong>
                                <span>Wrap-up, Memories & Departures</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* --- SECURITY / PASSCODE CARD --- */}
                <div className="dashboard-card security-card">
                    <h2>Guest Access Control</h2>
                    <p>Change the 4-digit passcode required for guests to view the itinerary. Update this for every new tour group.</p>
                    
                    <form onSubmit={handleSavePasscode} className="passcode-form">
                        <div className="passcode-display">
                            <input 
                                type="text" 
                                value={passcode}
                                onChange={handlePasscodeChange}
                                placeholder="••••"
                                className="dashboard-passcode-input"
                            />
                        </div>
                        
                        <button type="submit" className="dashboard-save-button" disabled={isSaving}>
                            {isSaving ? 'Updating...' : 'Change Passcode'}
                        </button>
                    </form>

                    <div className="security-notice">
                        <strong>Note:</strong> Guests using the old passcode will be locked out immediately once you change this.
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;