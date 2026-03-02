import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedFooter from '../../components/presentational/SharedFooter';
import './GuestLogin.css';

const GuestLogin = () => {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // TODO: Later, we will connect this to your Supabase 'settings' table to check the active PIN.
        // For right now, we will hardcode '1234' so you can test the routing.
        if (passcode === '1234') {
            sessionStorage.setItem('guestAuthenticated', 'true');
            navigate('/'); // Send them to the welcome page
        } else {
            setError('Incorrect passcode. Please check your Welcome Email.');
            setPasscode('');
        }
    };

    return (
        <div className="guest-login-wrapper">
            <div className="guest-login-container">
                <div className="login-card">
                    <h1 className="login-title">OAT Tours Turkey</h1>
                    <p className="login-subtitle">Please enter your 4-digit tour passcode to access your daily itinerary.</p>
                    
                    <form onSubmit={handleSubmit} className="login-form">
                        <input 
                            type="password" 
                            maxLength="4"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                            placeholder="• • • •"
                            className="passcode-input"
                            autoFocus
                        />
                        {error && <p className="error-text">{error}</p>}
                        
                        <button type="submit" className="login-button">
                            Enter Tour
                        </button>
                    </form>
                </div>
            </div>
            {/* Using the shared footer so it looks cohesive even before they log in */}
            <SharedFooter role="guest" /> 
        </div>
    );
};

export default GuestLogin;