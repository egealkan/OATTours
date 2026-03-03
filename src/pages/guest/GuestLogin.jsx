import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient'; // Import Supabase
import SharedFooter from '../../components/presentational/SharedFooter';
import './GuestLogin.css';

const GuestLogin = () => {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Fetch the official passcode from the database
            const { data, error: fetchError } = await supabase
                .from('settings')
                .select('guest_passcode')
                .eq('id', 1)
                .single();

            if (fetchError) throw fetchError;

            // Verify the entered passcode matches the database passcode
            if (data && data.guest_passcode === passcode) {
                sessionStorage.setItem('guestAuthenticated', 'true');
                navigate('/'); 
            } else {
                setError('Incorrect passcode. Please check your Welcome Email.');
                setPasscode('');
            }
        } catch (err) {
            console.error(err);
            setError('System error verifying passcode. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="guest-login-wrapper">
            <div className="guest-login-container">
                <div className="guest-login-card">
                    
                    <div className="guest-login-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-terracotta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>

                    <h1 className="guest-login-title">OAT Tours Turkey</h1>
                    <p className="guest-login-subtitle">Please enter your 4-digit tour passcode to access your daily itinerary.</p>
                    
                    <form onSubmit={handleSubmit} className="guest-login-form">
                        <input 
                            type="password" 
                            maxLength="4"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                            placeholder="••••"
                            className="guest-passcode-input"
                            autoFocus
                            disabled={isLoading}
                        />
                        
                        {error && <p className="guest-error-text">{error}</p>}
                        
                        <button type="submit" className="guest-login-button" disabled={isLoading || passcode.length !== 4}>
                            {isLoading ? 'Verifying...' : 'Enter Tour'}
                        </button>
                    </form>
                </div>
            </div>
            <SharedFooter role="guest" /> 
        </div>
    );
};

export default GuestLogin;