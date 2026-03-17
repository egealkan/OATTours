import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import './GuestFarewellPage.css';

export default function GuestFarewellPage() {
  const [loading, setLoading] = useState(true);
  const [tourData, setTourData] = useState(null);
  const [travelers, setTravelers] = useState([]);
  const [itinerarySummary, setItinerarySummary] = useState([]);
  const [farewellRestaurant, setFarewellRestaurant] = useState(null);
  
  // Modal States
  const [isTravelerModalOpen, setIsTravelerModalOpen] = useState(false);
  const [isPlacesModalOpen, setIsPlacesModalOpen] = useState(false);

  useEffect(() => {
    fetchFarewellData();
  }, []);

  const fetchFarewellData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Active Tour
      const { data: activeTour, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .single();

      if (tourError || !activeTour) throw new Error("No active tour found.");
      setTourData(activeTour);

      // 2. Fetch Travelers for this tour
      const { data: tourTravelers } = await supabase
        .from('travelers')
        .select('*')
        .eq('tour_id', activeTour.id)
        .order('name', { ascending: true });
      if (tourTravelers) setTravelers(tourTravelers);

      // 3. Fetch Farewell Restaurant Info
      if (activeTour.farewell_dinner_restaurant_id) {
          const { data: restaurant } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', activeTour.farewell_dinner_restaurant_id)
            .single();
          if (restaurant) setFarewellRestaurant(restaurant);
      }

      // 4. Auto-Generate Itinerary Summary (with Images)
      const { data: days } = await supabase.from('tour_days').select('id').eq('tour_id', activeTour.id);
      if (days && days.length > 0) {
          const dayIds = days.map(d => d.id);
          // Fetch both name and image URL
          const { data: places } = await supabase.from('daily_places').select('place_name, image_url').in('tour_day_id', dayIds);
          
          if (places) {
              // Filter out virtual meals
              const validPlaces = places.filter(p => p.place_name !== 'LUNCH_RESTAURANT' && p.place_name !== 'DINNER_RESTAURANT');
              
              // Remove duplicates based on place_name while keeping the object structure
              const uniquePlacesMap = new Map();
              validPlaces.forEach(place => {
                  if (!uniquePlacesMap.has(place.place_name)) {
                      uniquePlacesMap.set(place.place_name, place);
                  }
              });
              
              const uniquePlaces = Array.from(uniquePlacesMap.values());
              setItinerarySummary(uniquePlaces);
          }
      }

    } catch (error) {
      console.error("Error fetching farewell data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Prevent background scrolling when ANY modal is open
  useEffect(() => {
    if (isTravelerModalOpen || isPlacesModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isTravelerModalOpen, isPlacesModalOpen]);

  const formatTime = (timeString) => {
      if (!timeString) return 'TBA';
      const [hourString, minute] = timeString.split(':');
      const hour = parseInt(hourString, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minute} ${ampm}`;
  };

  if (loading) {
    return <div className="loading-spinner">Loading Farewell Details...</div>;
  }

  if (!tourData) {
    return <div className="error-message">Could not load farewell information.</div>;
  }

  return (
    <div className={`guest-page-wrapper ${isTravelerModalOpen ? 'print-modal-only' : ''}`}>
      <div className="guest-header">
        <h1>Farewell & Wrap-Up</h1>
        <p>As our journey comes to an end, here is everything you need for our final day together.</p>
      </div>

      {/* Departure Logistics Card (Modal Trigger) */}
      <div className="info-card center-card">
        <h2>✈️ Departure Logistics</h2>
        <p className="card-summary-text">
          Please review your final airport transfer and flight times below so you are ready for departure.
        </p>
        <button 
          className="btn-open-modal"
          onClick={() => setIsTravelerModalOpen(true)}
        >
          View Departure Times
        </button>
      </div>

      {/* Farewell Dinner Card */}
      <div className="info-card center-card">
        <h2>🍽️ Our Farewell Dinner</h2>
        <div className="highlight-box">
          <p className="highlight-title">Restaurant</p>
          <p className="highlight-value">{farewellRestaurant ? farewellRestaurant.name : 'TBA'}</p>
        </div>
        <div className="highlight-box">
          <p className="highlight-title">Meeting Time</p>
          <p className="highlight-value highlight-time-color">
            {tourData.farewell_meeting_time ? formatTime(tourData.farewell_meeting_time) : 'TBA'}
          </p>
        </div>
      </div>

      {/* Trip Memories & Discussions */}
      {(tourData.learning_and_discoveries || tourData.controversial_topic) && (
          <div className="info-card">
            <h2>🗣️ Trip Discussions & Memories</h2>
            
            {tourData.learning_and_discoveries && (
                <div className="data-section">
                    <h3>Learning & Discoveries</h3>
                    <p className="discussion-text">{tourData.learning_and_discoveries}</p>
                </div>
            )}

            {tourData.controversial_topic && (
                <div className="data-section" style={{ marginTop: '25px' }}>
                    <h3>Controversial Topic</h3>
                    <p className="discussion-text">{tourData.controversial_topic}</p>
                </div>
            )}
          </div>
      )}

      {/* Places Explored (Modal Trigger) */}
      <div className="info-card center-card">
        <h2>🗺️ Places We Explored</h2>
        <p className="card-summary-text">
          Take a look back at the beautiful destinations and historic sites we visited on this journey.
        </p>
        <button 
          className="btn-open-modal"
          onClick={() => setIsPlacesModalOpen(true)}
        >
          View Places Explored
        </button>
      </div>

      {/* Goodbye Message */}
      {tourData.goodbye_message && (
          <div className="info-card guide-card">
            <h2>👋 A Word from Your Guide</h2>
            <div className="guide-content-flex" style={{ alignItems: 'center' }}>
                {/* Replaced the blue circle with an image */}
                <img 
                    src="/oat.png" 
                    alt="OAT Logo" 
                    className="guide-avatar"
                    style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'contain', 
                        border: 'none', 
                        boxShadow: 'none',
                        backgroundColor: 'transparent'
                    }} 
                />
                <div className="guide-details" style={{ width: '100%' }}>
                    <p className="about-me-text" style={{ fontStyle: 'italic', fontSize: '1.15rem' }}>
                        "{tourData.goodbye_message}"
                    </p>
                </div>
            </div>
          </div>
      )}

      {/* --- TRAVELER DEPARTURE MODAL --- */}
      {isTravelerModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTravelerModalOpen(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
              <h2>✈️ Traveler Departure Times</h2>
              <div className="modal-header-actions no-print">
                <button className="btn-print" onClick={() => window.print()}>
                  📄 Save to PDF
                </button>
                <button className="btn-close-modal" onClick={() => setIsTravelerModalOpen(false)}>&times;</button>
              </div>
            </div>
            <div className="modal-body">
              {travelers.length > 0 ? (
                <div className="traveler-list-wrapper">
                  <div className="traveler-list-header">
                      <div className="col-name">Traveler Name</div>
                      <div className="col-time">Pickup Time</div>
                      <div className="col-time">Flight Time</div>
                  </div>
                  
                  <div className="traveler-list-body">
                      {travelers.map((t) => (
                          <div key={t.id} className="traveler-list-row">
                              <div className="col-name"><strong>{t.name}</strong></div>
                              <div className="col-time">
                                  <span className="mobile-label">Pickup: </span>
                                  {t.departure_pickup_time ? formatTime(t.departure_pickup_time) : 'TBA'}
                              </div>
                              <div className="col-time">
                                  <span className="mobile-label">Flight: </span>
                                  <span className="flight-highlight">
                                      {t.departure_flight_time ? formatTime(t.departure_flight_time) : 'TBA'}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="empty-text">Departure logistics are not finalized yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- PLACES EXPLORED MODAL --- */}
      {isPlacesModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPlacesModalOpen(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗺️ Places We Explored</h2>
              <button className="btn-close-modal" onClick={() => setIsPlacesModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {itinerarySummary.length > 0 ? (
                <div className="places-grid">
                  {itinerarySummary.map((place, index) => (
                    <div key={index} className="place-card">
                      {place.image_url ? (
                          <img src={place.image_url} alt={place.place_name} className="place-image" />
                      ) : (
                          <div className="place-image-placeholder">🏛️</div>
                      )}
                      <h3 className="place-name">{place.place_name}</h3>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">Our journey summary is currently being compiled.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}