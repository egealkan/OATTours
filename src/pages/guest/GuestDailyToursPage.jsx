import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import './GuestDailyToursPage.css';

export default function GuestDailyToursPage() {
  const [loading, setLoading] = useState(true);
  const [tourDays, setTourDays] = useState([]);
  const [dailyPlaces, setDailyPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState(null); // { url, caption }
  
  useEffect(() => {
    fetchItineraryData();
  }, []);

  useEffect(() => {
    if (selectedDayIndex !== null) {
      const city = tourDays[selectedDayIndex]?.weather_city_name;
      if (city) {
        fetchWeatherForCity(city);
      } else {
        setLiveWeather(null);
      }
    }
  }, [selectedDayIndex, tourDays]);

  // Force scroll to top when opening/closing a day
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDayIndex]);

  const fetchItineraryData = async () => {
    try {
      setLoading(true);
      
      const { data: activeTour, error: tourError } = await supabase
        .from('tours')
        .select('id')
        .eq('is_active', true)
        .single();

      if (tourError || !activeTour) throw new Error("No active tour found.");

      const { data: daysData } = await supabase
        .from('tour_days')
        .select('*')
        .eq('tour_id', activeTour.id)
        .eq('is_post_trip', false)
        .order('date', { ascending: true });
      if (daysData) setTourDays(daysData);

      const { data: placesData } = await supabase.from('daily_places').select('*');
      if (placesData) setDailyPlaces(placesData);

      const { data: hotelsData } = await supabase.from('hotels').select('*');
      if (hotelsData) setHotels(hotelsData);

      const { data: restData } = await supabase.from('restaurants').select('*');
      if (restData) setRestaurants(restData);

    } catch (error) {
      console.error("Error fetching daily tours:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherForCity = async (cityName) => {
    setWeatherLoading(true);
    setLiveWeather(null);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      
      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude } = geoData.results[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`);
        const weatherData = await weatherRes.json();
        
        if (weatherData.current_weather) {
            setLiveWeather({
                temp: Math.round(weatherData.current_weather.temperature),
                code: weatherData.current_weather.weathercode
            });
        }
      }
    } catch (error) {
      console.error("Could not fetch weather:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const formatUSDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Helper to check if a day is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const checkDate = new Date(dateString + 'T12:00:00'); // add this
      return today.getDate() === checkDate.getDate() && 
             today.getMonth() === checkDate.getMonth() && 
             today.getFullYear() === checkDate.getFullYear();
  };

  const getWeatherDescription = (code) => {
      if (code === 0) return { text: "Clear Sky", emoji: "☀️" };
      if (code >= 1 && code <= 3) return { text: "Partly Cloudy", emoji: "⛅" };
      if (code >= 45 && code <= 48) return { text: "Foggy", emoji: "🌫️" };
      if (code >= 51 && code <= 67) return { text: "Rain", emoji: "🌧️" };
      if (code >= 71 && code <= 77) return { text: "Snow", emoji: "❄️" };
      if (code >= 95 && code <= 99) return { text: "Thunderstorm", emoji: "⛈️" };
      return { text: "Varying", emoji: "🌡️" };
  };

  if (loading) {
    return <div className="loading-spinner">Loading your itinerary...</div>;
  }

  // --- RENDER DETAIL VIEW ---
  if (selectedDayIndex !== null) {
      const day = tourDays[selectedDayIndex];
      const placesForDay = dailyPlaces.filter(p => p.tour_day_id === day.id);
      const dayHotel = hotels.find(h => h.id === day.hotel_id);
      const lunchRest = restaurants.find(r => r.id === day.lunch_restaurant_id);
      const dinnerRest = restaurants.find(r => r.id === day.dinner_restaurant_id);

      const hasMorningSchedule = day.wake_up_time || day.suitcase_pickup_time || day.breakfast_time || day.departure_time;
      const hasEveningSchedule = day.free_time_start || day.hotel_arrival_time || day.dinner_time;

      return (
        
          <div className="guest-page-wrapper slide-in">
              <div className="detail-controls no-print">
                  <button className="btn-back" onClick={() => setSelectedDayIndex(null)}>
                      &larr; Back to Itinerary
                  </button>
                  <button className="btn-print" onClick={() => window.print()}>
                      📄 Save Day as PDF
                  </button>
              </div>

              <div className="day-detail-header">
                  {isToday(day.date) && <div className="today-header-badge">⭐ TODAY'S ITINERARY</div>}
                  <h1>Day {selectedDayIndex + 1}</h1>
                  <p className="day-detail-date">{formatUSDate(day.date)}</p>
                  
                  {day.weather_city_name && (
                      <div className="weather-widget">
                          <span className="weather-city">📍 {day.weather_city_name}</span>
                          {weatherLoading ? (
                              <span className="weather-status">Fetching live weather...</span>
                          ) : liveWeather ? (
                              <div className="weather-data">
                                  <span className="weather-emoji">{getWeatherDescription(liveWeather.code).emoji}</span>
                                  <div className="weather-info-block">
                                      <span className="weather-temp">{liveWeather.temp}°F</span>
                                      <span className="weather-desc">{getWeatherDescription(liveWeather.code).text}</span>
                                  </div>
                              </div>
                          ) : (
                              <span className="weather-status">Weather unavailable</span>
                          )}
                      </div>
                  )}
              </div>

              {/* Schedule Card - Separated into Morning/Departure and Evening/Arrival */}
              {(hasMorningSchedule || hasEveningSchedule) && (
                  <div className="info-card">
                      <h2>🕒 Daily Schedule</h2>
                      
                      {hasMorningSchedule && (
                          <div className="schedule-category">
                              <h3 className="category-title">🌅 Morning & Departure</h3>
                              <div className="schedule-grid">
                                  {day.wake_up_time && <div className="schedule-item"><span className="time">{day.wake_up_time}</span><span className="event">Wake Up</span></div>}
                                  {day.suitcase_pickup_time && <div className="schedule-item"><span className="time highlight-time">{day.suitcase_pickup_time}</span><span className="event">Suitcase Pickup</span></div>}
                                  {day.breakfast_time && <div className="schedule-item"><span className="time">{day.breakfast_time}</span><span className="event">Breakfast</span></div>}
                                  {day.departure_time && <div className="schedule-item"><span className="time highlight-time">{day.departure_time}</span><span className="event">Departure</span></div>}
                              </div>
                          </div>
                      )}

                      {hasMorningSchedule && hasEveningSchedule && <div className="schedule-divider"></div>}

                      {hasEveningSchedule && (
                          <div className="schedule-category">
                              <h3 className="category-title">🌆 Afternoon & Arrival</h3>
                              <div className="schedule-grid">
                                  {day.free_time_start && <div className="schedule-item"><span className="time">{day.free_time_start}</span><span className="event">Free Time Begins</span></div>}
                                  {day.hotel_arrival_time && <div className="schedule-item"><span className="time">{day.hotel_arrival_time}</span><span className="event">Hotel Arrival</span></div>}
                                  {day.dinner_time && <div className="schedule-item"><span className="time">{day.dinner_time}</span><span className="event">Dinner Time</span></div>}
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* Places Visited Card */}
              {placesForDay.length > 0 && (
                  <div className="info-card">
                      <h2>📸 Places We'll Visit</h2>
                      <div className="places-grid">
                          {placesForDay.map(place => (
                              <div key={place.id} className="place-card">
                                  {place.image_url ? (
                                        <img
                                            src={place.image_url}
                                            alt={place.place_name}
                                            className="place-image guide-avatar-clickable"
                                            onClick={() => setSelectedPhoto({ url: place.image_url, caption: place.place_name })}
                                            title="Tap to enlarge"
                                        />
                                    ) : (
                                        <div className="place-image-placeholder">🏛️</div>
                                    )}
                                  <h3 className="place-name">{place.place_name}</h3>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Meals & Accommodation Card */}
              <div className="info-card">
                  <h2>🍽️ Meals & Accommodation</h2>
                  
                  {lunchRest && (
                      <div className="logistics-row">
                          <span className="logistics-icon">🍲</span>
                          <div>
                              <strong>Lunch:</strong> {lunchRest.name}
                          </div>
                      </div>
                  )}
                  {dinnerRest && (
                      <div className="logistics-row">
                          <span className="logistics-icon">🍷</span>
                          <div>
                              <strong>Dinner:</strong> {dinnerRest.name}
                          </div>
                      </div>
                  )}
                  {dayHotel && (
                      <div className="logistics-row">
                          <span className="logistics-icon">🏨</span>
                          <div>
                              <strong>Hotel:</strong> {dayHotel.name}
                          </div>
                      </div>
                  )}
                  {!lunchRest && !dinnerRest && !dayHotel && (
                      <p className="empty-text">No specific meals or hotel logged for today.</p>
                  )}
              </div>

              {/* Map Embed Card */}
              {day.route_map_embed_url && (
                  <div className="info-card">
                      <h2>🗺️ Today's Route</h2>
                      <div className="map-container">
                          <iframe 
                              src={day.route_map_embed_url} 
                              width="100%" 
                              height="400" 
                              style={{ border: 0, borderRadius: '8px' }} 
                              allowFullScreen="" 
                              loading="lazy" 
                              referrerPolicy="no-referrer-when-downgrade"
                              title={`Route map for Day ${selectedDayIndex + 1}`}
                          ></iframe>
                      </div>
                  </div>
              )}
              {/* Bottom Back Button */}
              <div className="detail-controls-bottom no-print">
                  <button className="btn-back-bottom" onClick={() => setSelectedDayIndex(null)}>
                      &larr; Back to Itinerary
                  </button>
              </div>
              {/* Photo Lightbox Modal */}
                {selectedPhoto && (
                    <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
                        <div className="photo-modal-container" onClick={e => e.stopPropagation()}>
                            <button className="photo-modal-close" onClick={() => setSelectedPhoto(null)}>&times;</button>
                            <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="photo-modal-img" />
                            {selectedPhoto.caption && <p className="photo-modal-caption">{selectedPhoto.caption}</p>}
                        </div>
                    </div>
                )}
          </div>
      );
  }

  // --- RENDER MAIN GRID VIEW ---
  return (
    <div className="guest-page-wrapper">
      <div className="guest-header">
        <h1>Daily Itinerary</h1>
        <p>Select a day to view our schedule, weather, and destinations.</p>
      </div>

      {tourDays.length > 0 ? (
        <div className="itinerary-grid">
            {tourDays.map((day, index) => {
                const dayIsToday = isToday(day.date);
                
                return (
                    <div 
                        key={day.id} 
                        className={`itinerary-card ${dayIsToday ? 'itinerary-card-today' : ''}`} 
                        onClick={() => setSelectedDayIndex(index)}
                    >
                        <div className={`card-day-badge ${dayIsToday ? 'badge-today' : ''}`}>
                            Day {index + 1}
                            {dayIsToday && <span className="badge-today-text">⭐ TODAY</span>}
                        </div>
                        <div className="card-content">
                            <h3 className="card-date">{formatUSDate(day.date)}</h3>
                            {day.weather_city_name && (
                                <p className="card-city">📍 {day.weather_city_name}</p>
                            )}
                            <span className="card-action">View Details &rarr;</span>
                        </div>
                    </div>
                );
            })}
        </div>
      ) : (
          <div className="error-message">
              The itinerary for this tour is currently being finalized. Check back soon!
          </div>
      )}
    </div>
  );
}