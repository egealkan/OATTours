import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import './GuestWelcomeMeetingPage.css';

export default function GuestWelcomeMeetingPage() {
  const [loading, setLoading] = useState(true);
  const [tourData, setTourData] = useState(null);
  const [guideData, setGuideData] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [hotels, setHotels] = useState([]);
  
  // Modal states
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);

  useEffect(() => {
    fetchWelcomeMeetingData();
  }, []);

  const fetchWelcomeMeetingData = async () => {
    try {
      setLoading(true);
      
      const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .single();

      if (tourError) throw tourError;
      setTourData(tour);

      const { data: guide, error: guideError } = await supabase
        .from('guide_profile')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (!guideError) setGuideData(guide);

      const { data: restData } = await supabase.from('restaurants').select('*');
      if (restData) setRestaurants(restData);

      const { data: hotelsData } = await supabase.from('hotels').select('*'); 
      if (hotelsData) setHotels(hotelsData);

    } catch (error) {
      console.error("Error fetching welcome meeting data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Prevent background scrolling when ANY modal is open
  useEffect(() => {
    if (isBioModalOpen || isHotelModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isBioModalOpen, isHotelModalOpen]);

  if (loading) {
    return <div className="loading-spinner">Loading your adventure...</div>;
  }

  if (!tourData || !guideData) {
    return <div className="error-message">Could not load tour information.</div>;
  }

  const welcomeRestaurant = restaurants.find(r => r.id === tourData.welcome_dinner_restaurant_id);
  const farewellRestaurant = restaurants.find(r => r.id === tourData.farewell_dinner_restaurant_id);

  // US Date Formatter helper
  const formatUSDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="guest-page-wrapper">
      <div className="guest-header">
        <h1>Welcome Meeting</h1>
        <p>{tourData.general_trip_info || "Everything you need to know as we begin our journey."}</p>
      </div>

      {/* Guide Card */}
      <div className="info-card guide-card">
        <h2>👋 Your Trip Leader</h2>
        <div className="guide-content-flex">
          {guideData.profile_image_url ? (
            <img src={guideData.profile_image_url} alt={guideData.name} className="guide-avatar" />
          ) : (
            <div className="guide-avatar-placeholder">
              {guideData.name ? guideData.name.charAt(0).toUpperCase() : 'G'}
            </div>
          )}
          <div className="guide-details">
            <h3>{guideData.name}</h3>
            {guideData.years_at_oat && (
              <span className="guide-badge">{guideData.years_at_oat} Years with OAT</span>
            )}
            <p className="about-me-text">
              {guideData.about_me ? 
                (guideData.about_me.length > 150 ? `${guideData.about_me.substring(0, 150)}...` : guideData.about_me) 
                : "I can't wait to meet you all and explore Turkey together!"}
            </p>
            {guideData.about_me && guideData.about_me.length > 150 && (
                <button className="btn-open-modal" onClick={() => setIsBioModalOpen(true)} style={{ marginTop: '10px' }}>
                    Read Full Bio
                </button>
            )}
          </div>
        </div>
      </div>

      {/* Accommodations Card (Now a Modal Trigger) */}
      <div className="info-card center-card">
        <h2>🏨 Our Accommodations</h2>
        <p className="card-summary-text">
          We have carefully selected a series of comfortable and authentic hotels for our journey. Click below to view our full accommodation list.
        </p>
        <button 
          className="btn-open-modal"
          onClick={() => setIsHotelModalOpen(true)}
        >
          View All Hotels
        </button>
      </div>

      {/* Gullet Info Card */}
      <div className="info-card center-card">
        <h2>⛵ Turkish Gulet Experience</h2>
        <div className="highlight-box">
          <p className="highlight-title">Vessel</p>
          <p className="highlight-value">{tourData.gullet_name || "TBA"}</p>
        </div>
        <div className="highlight-box">
          <p className="highlight-title">Route</p>
          <p className="highlight-value">{tourData.gullet_direction}</p>
        </div>
      </div>

      {/* Dining Card */}
      <div className="info-card">
        <h2>🍽️ Key Dining Experiences</h2>
        <div className="data-section">
          <h3>Welcome Dinner</h3>
          {welcomeRestaurant ? (
             <div className="grid-item"><span className="item-title">{welcomeRestaurant.name}</span></div>
          ) : <p className="empty-text">TBA</p>}
        </div>
        
        <div className="data-section" style={{ marginTop: '20px' }}>
          <h3>Farewell Dinner</h3>
          {farewellRestaurant ? (
             <div className="grid-item"><span className="item-title">{farewellRestaurant.name}</span></div>
          ) : <p className="empty-text">TBA</p>}
        </div>
      </div>

      {/* Cultural Experiences Card */}
      <div className="info-card">
        <h2>🌍 Cultural Experiences</h2>
        <div className="data-section">
          <h3>Home-Hosted Dinner</h3>
          <p className="data-row"><strong>Village:</strong> {tourData.home_hosted_village || "TBA"}</p>
          <p className="data-row"><strong>Host Family:</strong> The {tourData.home_hosted_family_names || "TBA"} Family</p>
        </div>
        <div className="data-section" style={{ marginTop: '20px' }}>
          <h3>A Day in the Life</h3>
          <p className="data-row">{tourData.day_in_life_activity || "TBA"}</p>
        </div>
      </div>

      {/* Flight Info Card */}
      <div className="info-card center-card">
        <h2>✈️ Domestic Flight</h2>
        <div className="items-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="grid-item center-content">
            <span className="item-title">{tourData.domestic_flight_airport || "TBA"}</span>
            <span className="item-subtext">{tourData.domestic_flight_city}</span>
            {tourData.domestic_flight_date && (
                <span className="item-highlight-date">{formatUSDate(tourData.domestic_flight_date)}</span>
            )}
            {tourData.domestic_flight_time && (
                <span className="item-highlight-time">{tourData.domestic_flight_time}</span>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Bio Modal */}
      {isBioModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBioModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👋 About {guideData.name}</h2>
              <button className="btn-close-modal" onClick={() => setIsBioModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-text">{guideData.about_me}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Modal */}
      {isHotelModalOpen && (
        <div className="modal-overlay" onClick={() => setIsHotelModalOpen(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏨 Accommodations List</h2>
              <button className="btn-close-modal" onClick={() => setIsHotelModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {hotels.length > 0 ? (
                <div className="items-grid">
                  {hotels.map(hotel => (
                    <div key={hotel.id} className="grid-item hotel-card">
                      {hotel.image_url && (
                        <img src={hotel.image_url} alt={hotel.name} className="hotel-image" />
                      )}
                      <span className="item-title">{hotel.name}</span>
                      {hotel.description && <span className="item-subtext">{hotel.description}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">Hotels have not been assigned yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}