import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [passcode, setPasscode] = useState('');
    const [isSavingPasscode, setIsSavingPasscode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Pre-trip link state
    const [preTripUrl, setPreTripUrl] = useState('');
    const [preTripDescription, setPreTripDescription] = useState('');
    const [isSavingLink, setIsSavingLink] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                setPasscode(data.guest_passcode || '');
                setPreTripUrl(data.pre_trip_info_url || '');
                setPreTripDescription(data.pre_trip_info_description || '');
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
        
        if (passcode.length !== 6) {
            toast.error('Passcode must be exactly 6 digits.');
            return;
        }

        setIsSavingPasscode(true);
        const toastId = toast.loading('Updating Passcode...');

        try {
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
            setIsSavingPasscode(false);
        }
    };

    const handleSaveLink = async (e) => {
        e.preventDefault();
        setIsSavingLink(true);
        const toastId = toast.loading('Saving link...');

        try {
            const { error } = await supabase.from('settings').upsert({
                id: 1,
                pre_trip_info_url: preTripUrl.trim() || null,
                pre_trip_info_description: preTripDescription.trim() || null,
            }, { onConflict: 'id' });

            if (error) throw error;

            toast.success('Pre-trip link saved!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Failed to save link.', { id: toastId });
        } finally {
            setIsSavingLink(false);
        }
    };

    const handlePasscodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
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

                        <Link to="/admin/calendar" className="dashboard-link">
                            <span className="link-icon">📅</span>
                            <div className="link-text">
                                <strong>Tour Calendar</strong>
                                <span>Schedule & View All Tour Dates</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* --- SECURITY / PASSCODE CARD --- */}
                <div className="dashboard-card security-card">
                    <h2>Guest Access Control</h2>
                    <p>Change the 6-digit passcode required for guests to view the itinerary. Update this for every new tour group.</p>
                    
                    <form onSubmit={handleSavePasscode} className="passcode-form">
                        <div className="passcode-display">
                            <input 
                                type="text" 
                                value={passcode}
                                onChange={handlePasscodeChange}
                                placeholder="••••••"
                                className="dashboard-passcode-input"
                            />
                        </div>
                        
                        <button type="submit" className="dashboard-save-button" disabled={isSavingPasscode}>
                            {isSavingPasscode ? 'Updating...' : 'Change Passcode'}
                        </button>
                    </form>

                    <div className="security-notice">
                        <strong>Note:</strong> Guests using the old passcode will be locked out immediately once you change this.
                    </div>
                </div>

            </div>

            {/* --- PRE-TRIP RESOURCE LINK CARD (full width) --- */}
            <div className="dashboard-card resource-card">
                <h2>Pre-Trip Resource Link</h2>
                <p>
                    Set an external link (e.g. an OAT website or PDF) that guests can access from the Pre-Trip Information page.
                    Include a short description so guests know what they'll find there.
                </p>

                <form onSubmit={handleSaveLink} className="resource-form">
                    <div>
                        <label className="resource-label">Resource URL</label>
                        <input
                            type="text"
                            className="resource-input"
                            value={preTripUrl}
                            onChange={e => setPreTripUrl(e.target.value)}
                            placeholder="https://www.oattravel.com/pre-trip-info"
                        />
                    </div>
                    <div>
                        <label className="resource-label">Description for Guests</label>
                        <textarea
                            className="resource-input resource-textarea"
                            value={preTripDescription}
                            onChange={e => setPreTripDescription(e.target.value)}
                            placeholder="Find detailed information about airport meeting points, what to pack, useful tips, and more to prepare for your journey."
                        />
                    </div>
                    {preTripUrl && (
                        <div>
                            <a href={preTripUrl} target="_blank" rel="noopener noreferrer" className="resource-link-preview">
                                🔗 Preview: {preTripUrl}
                            </a>
                        </div>
                    )}
                    <button type="submit" className="resource-save-btn" disabled={isSavingLink}>
                        {isSavingLink ? 'Saving...' : 'Save Resource Link'}
                    </button>
                </form>
            </div>

        </div>
    );
};

export default AdminDashboard;