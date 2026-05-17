import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import './GuestDashboard.css';

const GuestDashboard = () => {
    const navigate = useNavigate();
    // Default true so the card doesn't flash-disappear if post-trip is enabled
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
                    setShowPostTrip(data.show_post_trip !== false);
                }
            } catch (err) {
                console.error('Could not load post-trip setting:', err);
            }
        };

        fetchPostTripSetting();
    }, []);

    const menuItems = [
        { id: 'welcome-email',    title: 'Welcome Info',      icon: '✉️', path: '/welcome-email' },
        { id: 'welcome-meeting',  title: 'Welcome Meeting',   icon: '🤝', path: '/welcome-meeting' },
        { id: 'daily-itinerary',  title: "Today's Itinerary", icon: '📍', path: '/daily-info' },
        { id: 'farewell',         title: 'Farewell',          icon: '👋', path: '/farewell' },
    ];

    // Only add Post Trip card when the setting is on
    if (showPostTrip) {
        menuItems.push({ id: 'post-trip', title: 'Post Trip', icon: '➕', path: '/post-trip' });
    }

    return (
        <div className="guest-dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome!</h1>
                <p>Everything you need for your journey in one place.</p>
            </header>

            <div className="guest-grid">
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className="guest-card"
                        onClick={() => navigate(item.path)}
                    >
                        <div className="card-icon">{item.icon}</div>
                        <h3>{item.title}</h3>
                        <span className="card-arrow">→</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GuestDashboard;








// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './GuestDashboard.css';

// const GuestDashboard = () => {
//   const navigate = useNavigate();

//   const menuItems = [
//     { id: 'welcome-email', title: 'Welcome Info', icon: '✉️', path: '/welcome-email' },
//     { id: 'welcome-meeting', title: 'Welcome Meeting', icon: '🤝', path: '/welcome-meeting' },
//     { id: 'daily-itinerary', title: 'Today\'s Itinerary', icon: '📍', path: '/daily-info' },
//     { id: 'farewell', title: 'Farewell', icon: '👋', path: '/farewell' },
//     { id: 'post-trip', title: 'Post Trip', icon: '➕', path: '/post-trip' },
//   ];

//   return (
//     <div className="guest-dashboard-container">
//       <header className="dashboard-header">
//         <h1>Welcome!</h1>
//         <p>Everything you need for your journey in one place.</p>
//       </header>

//       <div className="guest-grid">
//         {menuItems.map((item) => (
//           <div 
//             key={item.id} 
//             className="guest-card" 
//             onClick={() => navigate(item.path)}
//           >
//             <div className="card-icon">{item.icon}</div>
//             <h3>{item.title}</h3>
//             <span className="card-arrow">→</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default GuestDashboard;