// import React, { useState, useEffect } from 'react';
// import { supabase } from '../../services/supabaseClient';
// import toast from 'react-hot-toast';
// import './AdminDailyInfoEdit.css';

// const AdminDailyInfoEdit = () => {
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);
    
//     // Core Data
//     const [activeTourId, setActiveTourId] = useState(null);
//     const [hotelsRoster, setHotelsRoster] = useState([]);
//     const [restaurantsRoster, setRestaurantsRoster] = useState([]);
    
//     // Daily Info Data
//     const [tourDays, setTourDays] = useState([]);
//     const [dailyPlaces, setDailyPlaces] = useState([]);
    
//     // Travelers Data
//     const [travelers, setTravelers] = useState([]);

//     // Modal State
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingDay, setEditingDay] = useState(null);

//     useEffect(() => {
//         fetchAllData();
//     }, []);

//     const fetchAllData = async () => {
//         setIsLoading(true);
//         try {
//             // 1. Fetch Active Tour
//             const { data: activeTour } = await supabase.from('tours').select('id').eq('is_active', true).single();
//             if (!activeTour) {
//                 toast.error("No active tour found. Please create one in the Welcome pages first.");
//                 setIsLoading(false);
//                 return;
//             }
//             setActiveTourId(activeTour.id);

//             // 2. Fetch Hotels
//             const { data: hotels } = await supabase.from('hotels').select('*');
//             if (hotels) setHotelsRoster(hotels);

//             // 3. Fetch Restaurants
//             const { data: restaurants } = await supabase.from('restaurants').select('*');
//             if (restaurants) setRestaurantsRoster(restaurants);

//             // 4. Fetch Tour Days
//             const { data: days } = await supabase.from('tour_days').select('*').eq('tour_id', activeTour.id).order('date', { ascending: true });
//             if (days) setTourDays(days);

//             // 5. Fetch Daily Places
//             const { data: places } = await supabase.from('daily_places').select('*');
//             if (places) setDailyPlaces(places);

//             // 6. Fetch Travelers
//             const { data: tourTravelers } = await supabase.from('travelers').select('*').eq('tour_id', activeTour.id);
//             if (tourTravelers) setTravelers(tourTravelers);

//         } catch (error) {
//             toast.error("Error loading database information.");
//             console.error(error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // --- MODAL HANDLING ---
//     const openDayModal = (day = null) => {
//         if (day) {
//             const placesForDay = dailyPlaces.filter(p => p.tour_day_id === day.id);
//             setEditingDay({ 
//                 ...day, 
//                 places: placesForDay,
//                 lunch_restaurant_id: day.lunch_restaurant_id || '',
//                 dinner_restaurant_id: day.dinner_restaurant_id || ''
//             });
//         } else {
//             setEditingDay({
//                 id: 'new',
//                 tour_id: activeTourId,
//                 date: '',
//                 weather_city_name: '',
//                 route_map_embed_url: '',
//                 wake_up_time: '',
//                 breakfast_time: '',
//                 suitcase_pickup_time: '',
//                 departure_time: '',
//                 hotel_arrival_time: '',
//                 dinner_time: '',
//                 free_time_start: '',
//                 hotel_id: '',
//                 lunch_restaurant_id: '',
//                 dinner_restaurant_id: '',
//                 places: []
//             });
//         }
//         setIsModalOpen(true);
//     };

//     const closeDayModal = () => {
//         setIsModalOpen(false);
//         setEditingDay(null);
//     };

//     // --- SAVE SINGLE DAY (Inside Modal) ---
//     const handleSaveDay = async (e) => {
//         e.preventDefault();
//         setIsSaving(true);
//         const toastId = toast.loading('Saving Tour Day...');

//         try {
//             let currentDayId = editingDay.id;

//             // 1. Save the Core Tour Day (Now properly writing to the new restaurant columns)
//             const dayPayload = {
//                 tour_id: activeTourId,
//                 date: editingDay.date,
//                 weather_city_name: editingDay.weather_city_name,
//                 route_map_embed_url: editingDay.route_map_embed_url,
//                 wake_up_time: editingDay.wake_up_time,
//                 breakfast_time: editingDay.breakfast_time,
//                 suitcase_pickup_time: editingDay.suitcase_pickup_time,
//                 departure_time: editingDay.departure_time,
//                 hotel_arrival_time: editingDay.hotel_arrival_time,
//                 dinner_time: editingDay.dinner_time,
//                 free_time_start: editingDay.free_time_start,
//                 hotel_id: editingDay.hotel_id || null,
//                 lunch_restaurant_id: editingDay.lunch_restaurant_id || null,
//                 dinner_restaurant_id: editingDay.dinner_restaurant_id || null
//             };

//             if (currentDayId === 'new') {
//                 const { data: newDay, error } = await supabase.from('tour_days').insert([dayPayload]).select().single();
//                 if (error) throw error;
//                 currentDayId = newDay.id;
//             } else {
//                 const { error } = await supabase.from('tour_days').update(dayPayload).eq('id', currentDayId);
//                 if (error) throw error;
//             }

//             // 2. Save Daily Places (Proper normal pictures only)
//             if (currentDayId !== 'new') {
//                 await supabase.from('daily_places').delete().eq('tour_day_id', currentDayId);
//             }

//             if (editingDay.places.length > 0) {
//                 const placesPayload = editingDay.places.map(p => ({
//                     tour_day_id: currentDayId,
//                     place_name: p.place_name,
//                     image_url: p.image_url
//                 }));
//                 const { error: placesErr } = await supabase.from('daily_places').insert(placesPayload);
//                 if (placesErr) throw placesErr;
//             }

//             toast.success('Tour Day Saved!', { id: toastId });
//             closeDayModal();
//             fetchAllData(); 

//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to save day. Check console.', { id: toastId });
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // --- DELETE BUG FIX ---
//     const handleDeleteDay = async () => {
//         if (editingDay.id === 'new') return;
//         const confirmed = window.confirm('Are you sure you want to delete this entire day?');
//         if (!confirmed) return;

//         const toastId = toast.loading('Deleting day...');
//         try {
//             // FIX: We explicitly delete all daily places attached to this day first to clear the Foreign Key constraint
//             await supabase.from('daily_places').delete().eq('tour_day_id', editingDay.id);
            
//             // Now we can safely delete the day itself
//             const { error } = await supabase.from('tour_days').delete().eq('id', editingDay.id);
//             if (error) throw error;
            
//             toast.success('Day deleted permanently.', { id: toastId });
//             closeDayModal();
//             fetchAllData();
//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to delete. Check console.', { id: toastId });
//         }
//     };

//     // --- SAVE TRAVELERS ---
//     const handleSaveTravelers = async (e) => {
//         e.preventDefault();
//         setIsSaving(true);
//         const toastId = toast.loading('Saving Travelers...');

//         try {
//             const validTravelers = travelers.filter(t => t.name.trim() !== '');
//             const newTravelers = validTravelers.filter(t => typeof t.id === 'string' && t.id.startsWith('new_'));
//             const existingTravelers = validTravelers.filter(t => typeof t.id !== 'string' || !t.id.startsWith('new_'));

//             if (newTravelers.length > 0) {
//                 const { error } = await supabase.from('travelers').insert(
//                     newTravelers.map(t => ({ 
//                         tour_id: activeTourId, 
//                         name: t.name, 
//                         departure_pickup_time: t.departure_pickup_time, 
//                         departure_flight_time: t.departure_flight_time 
//                     }))
//                 );
//                 if (error) throw error;
//             }

//             if (existingTravelers.length > 0) {
//                 const { error } = await supabase.from('travelers').upsert(
//                     existingTravelers.map(t => ({ 
//                         id: t.id, 
//                         tour_id: activeTourId, 
//                         name: t.name, 
//                         departure_pickup_time: t.departure_pickup_time, 
//                         departure_flight_time: t.departure_flight_time 
//                     })), 
//                     { onConflict: 'id' }
//                 );
//                 if (error) throw error;
//             }

//             toast.success('Travelers Saved!', { id: toastId });
//             fetchAllData();
//         } catch (error) {
//             toast.error('Failed to save travelers.', { id: toastId });
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // --- DYNAMIC HELPERS ---
//     const handleDayFieldChange = (field, value) => setEditingDay(prev => ({ ...prev, [field]: value }));
//     const addPlace = () => setEditingDay(prev => ({ ...prev, places: [...prev.places, { place_name: '', image_url: '' }] }));
//     const updatePlace = (index, field, value) => {
//         const updatedPlaces = [...editingDay.places];
//         updatedPlaces[index][field] = value;
//         setEditingDay(prev => ({ ...prev, places: updatedPlaces }));
//     };
//     const removePlace = (index) => setEditingDay(prev => ({ ...prev, places: editingDay.places.filter((_, i) => i !== index) }));
    
//     const addTraveler = () => setTravelers(prev => [...prev, { id: `new_${Date.now()}`, name: '', departure_pickup_time: '', departure_flight_time: '' }]);
//     const updateTraveler = (index, field, value) => {
//         const updated = [...travelers];
//         updated[index][field] = value;
//         setTravelers(updated);
//     };
//     const removeTraveler = async (index, travelerId) => {
//         if (typeof travelerId !== 'string' || !travelerId.startsWith('new_')) {
//             const confirmed = window.confirm('Delete this traveler from the database?');
//             if (!confirmed) return;
//             await supabase.from('travelers').delete().eq('id', travelerId);
//         }
//         setTravelers(prev => prev.filter((_, i) => i !== index));
//     };

//     if (isLoading) return <div style={{ textAlign: 'center', marginTop: '10vh' }}>Loading Form...</div>;

//     return (
//         <div className="admin-edit-wrapper">
//             <div className="admin-edit-header">
//                 <h1>Daily Itineraries</h1>
//                 <p>Manage the daily schedule, places visited, and your travelers' departure info.</p>
//             </div>

//             {/* --- DAY CARDS GRID --- */}
//             <div className="days-grid">
//                 {tourDays.map((day, index) => (
//                     <div key={day.id} className="day-card" onClick={() => openDayModal(day)}>
//                         <h3>Day {index + 1}</h3>
//                         <span className="day-date">{day.date || 'No Date Set'}</span>
//                         <p>📍 {day.weather_city_name || 'No City Set'}</p>
//                         <button className="edit-card-btn">Edit Day Details</button>
//                     </div>
//                 ))}
                
//                 <div className="day-card create-new" onClick={() => openDayModal()}>
//                     <h3>+</h3>
//                     <span>Create New Tour Day</span>
//                 </div>
//             </div>

//             {/* --- TRAVELERS SECTION --- */}
//             <form className="edit-form-card" style={{ marginTop: '3rem' }} onSubmit={handleSaveTravelers}>
//                 <div className="form-section">
//                     <h3>Travelers & Departure Information</h3>
//                     <p className="hint-text">Add your travelers here. Use the clear headers to manage final day logistics.</p>
                    
//                     {/* Clear Header Row for iPad Visibility */}
//                     {travelers.length > 0 && (
//                         <div className="traveler-header-row">
//                             <div className="traveler-header-cell">#</div>
//                             <div className="traveler-header-cell">Traveler Name</div>
//                             <div className="traveler-header-cell">Pickup Time</div>
//                             <div className="traveler-header-cell">Flight Time</div>
//                             <div className="traveler-header-cell" style={{textAlign: 'center'}}></div>
//                         </div>
//                     )}

//                     {travelers.map((t, index) => (
//                         <div key={t.id} className="traveler-row">
//                             <div className="traveler-number">{index + 1}</div>
//                             <input 
//                                 type="text" placeholder="Name" value={t.name}
//                                 onChange={e => updateTraveler(index, 'name', e.target.value)} 
//                             />
//                             <input 
//                                 type="time" value={t.departure_pickup_time || ''}
//                                 onChange={e => updateTraveler(index, 'departure_pickup_time', e.target.value)} 
//                             />
//                             <input 
//                                 type="time" value={t.departure_flight_time || ''}
//                                 onChange={e => updateTraveler(index, 'departure_flight_time', e.target.value)} 
//                             />
//                             <button type="button" className="btn-remove-small" onClick={() => removeTraveler(index, t.id)}>X</button>
//                         </div>
//                     ))}
                    
//                     <button type="button" className="btn-add-secondary" onClick={addTraveler}>+ Add Traveler</button>
//                 </div>
//                 <button type="submit" className="save-button" disabled={isSaving}>
//                     {isSaving ? 'Saving...' : 'Save Travelers List'}
//                 </button>
//             </form>

//             {/* --- THE MODAL --- */}
//             {isModalOpen && (
//                 <div className="modal-overlay" onClick={closeDayModal}>
//                     <div className="modal-content" onClick={e => e.stopPropagation()}>
                        
//                         <div className="modal-header">
//                             <h2>{editingDay.id === 'new' ? 'Create Tour Day' : `Edit Date: ${editingDay.date}`}</h2>
//                             <button className="close-modal" onClick={closeDayModal}>×</button>
//                         </div>

//                         <form className="modal-form-body" onSubmit={handleSaveDay}>
                            
//                             <div className="form-section">
//                                 <h3>General Day Info</h3>
//                                 <div className="input-row">
//                                     <div>
//                                         <label>Date of this Day</label>
//                                         <input type="date" required value={editingDay.date} onChange={e => handleDayFieldChange('date', e.target.value)} />
//                                     </div>
//                                     <div>
//                                         <label>City (For Live Weather API)</label>
//                                         <input type="text" placeholder="e.g. Istanbul" value={editingDay.weather_city_name} onChange={e => handleDayFieldChange('weather_city_name', e.target.value)} />
//                                     </div>
//                                 </div>
//                                 <div style={{ marginTop: '1rem' }}>
//                                     <label>Google My Maps Embed URL (iframe src link)</label>
//                                     <input type="text" placeholder="https://www.google.com/maps/d/embed?mid=..." value={editingDay.route_map_embed_url} onChange={e => handleDayFieldChange('route_map_embed_url', e.target.value)} />
//                                 </div>
//                             </div>

//                             <div className="form-section">
//                                 <h3>Daily Schedule</h3>
//                                 <div className="input-row">
//                                     <div><label>Wake Up Time</label><input type="time" value={editingDay.wake_up_time || ''} onChange={e => handleDayFieldChange('wake_up_time', e.target.value)} /></div>
//                                     <div><label>Breakfast Time</label><input type="time" value={editingDay.breakfast_time || ''} onChange={e => handleDayFieldChange('breakfast_time', e.target.value)} /></div>
//                                 </div>
//                                 <div className="input-row" style={{ marginTop: '1rem' }}>
//                                     <div><label>Suitcase Pickup</label><input type="time" value={editingDay.suitcase_pickup_time || ''} onChange={e => handleDayFieldChange('suitcase_pickup_time', e.target.value)} /></div>
//                                     <div><label>Departure Time</label><input type="time" value={editingDay.departure_time || ''} onChange={e => handleDayFieldChange('departure_time', e.target.value)} /></div>
//                                 </div>
//                             </div>

//                             <div className="form-section">
//                                 <h3>Meals & Accommodation</h3>
//                                 <div className="input-row">
//                                     <div><label>Hotel Arrival Time</label><input type="time" value={editingDay.hotel_arrival_time || ''} onChange={e => handleDayFieldChange('hotel_arrival_time', e.target.value)} /></div>
//                                     <div><label>Free Time Begins</label><input type="time" value={editingDay.free_time_start || ''} onChange={e => handleDayFieldChange('free_time_start', e.target.value)} /></div>
//                                 </div>
//                                 <div className="input-row" style={{ marginTop: '1rem' }}>
//                                     <div>
//                                         <label>Dinner Time</label>
//                                         <input type="time" value={editingDay.dinner_time || ''} onChange={e => handleDayFieldChange('dinner_time', e.target.value)} />
//                                     </div>
//                                     <div>
//                                         <label>Select Hotel for Tonight</label>
//                                         <select value={editingDay.hotel_id || ''} onChange={e => handleDayFieldChange('hotel_id', e.target.value)}>
//                                             <option value="">-- No Hotel --</option>
//                                             {hotelsRoster.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
//                                         </select>
//                                     </div>
//                                 </div>
//                                 <div className="input-row" style={{ marginTop: '1rem' }}>
//                                     <div>
//                                         <label>Lunch Restaurant</label>
//                                         <select value={editingDay.lunch_restaurant_id || ''} onChange={e => handleDayFieldChange('lunch_restaurant_id', e.target.value)}>
//                                             <option value="">-- No Specific Lunch --</option>
//                                             {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <label>Dinner Restaurant</label>
//                                         <select value={editingDay.dinner_restaurant_id || ''} onChange={e => handleDayFieldChange('dinner_restaurant_id', e.target.value)}>
//                                             <option value="">-- No Specific Dinner --</option>
//                                             {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//                                         </select>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="form-section">
//                                 <h3>Places Visited Today</h3>
//                                 <p className="hint-text">These will show up as picture cards on the guest itinerary.</p>
//                                 {editingDay.places.map((place, index) => (
//                                     <div key={index} className="place-edit-row">
//                                         <input type="text" placeholder="Place Name (e.g. Hagia Sophia)" value={place.place_name} onChange={e => updatePlace(index, 'place_name', e.target.value)} />
//                                         <input type="text" placeholder="Image URL (https://...)" value={place.image_url} onChange={e => updatePlace(index, 'image_url', e.target.value)} />
//                                         <button type="button" className="btn-remove-small" onClick={() => removePlace(index)}>X</button>
//                                     </div>
//                                 ))}
//                                 <button type="button" className="btn-add-secondary" onClick={addPlace}>+ Add Place</button>
//                             </div>

//                             <div className="modal-action-bar">
//                                 {editingDay.id !== 'new' && (
//                                     <button type="button" className="btn-danger-modal" onClick={handleDeleteDay}>Delete Entire Day</button>
//                                 )}
//                                 <button type="submit" className="save-button-modal" disabled={isSaving}>
//                                     {isSaving ? 'Saving...' : 'Save Tour Day'}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AdminDailyInfoEdit;






import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/extras/ConfirmModal'; // Import your new component
import './AdminDailyInfoEdit.css';

const AdminDailyInfoEdit = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Core Data
    const [activeTourId, setActiveTourId] = useState(null);
    const [hotelsRoster, setHotelsRoster] = useState([]);
    const [restaurantsRoster, setRestaurantsRoster] = useState([]);
    
    // Daily Info Data
    const [tourDays, setTourDays] = useState([]);
    const [dailyPlaces, setDailyPlaces] = useState([]);
    
    // Travelers Data
    const [travelers, setTravelers] = useState([]);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDay, setEditingDay] = useState(null);

    // NEW: Custom Confirm Dialog State
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const { data: activeTour } = await supabase.from('tours').select('id').eq('is_active', true).single();
            if (!activeTour) {
                toast.error("No active tour found. Please create one in the Welcome pages first.");
                setIsLoading(false); return;
            }
            setActiveTourId(activeTour.id);

            const { data: hotels } = await supabase.from('hotels').select('*');
            if (hotels) setHotelsRoster(hotels);

            const { data: restaurants } = await supabase.from('restaurants').select('*');
            if (restaurants) setRestaurantsRoster(restaurants);

            const { data: days } = await supabase.from('tour_days').select('*').eq('tour_id', activeTour.id).order('date', { ascending: true });
            if (days) setTourDays(days);

            const { data: places } = await supabase.from('daily_places').select('*');
            if (places) setDailyPlaces(places);

            const { data: tourTravelers } = await supabase.from('travelers').select('*').eq('tour_id', activeTour.id);
            if (tourTravelers) setTravelers(tourTravelers);

        } catch (error) {
            toast.error("Error loading database information.");
        } finally {
            setIsLoading(false);
        }
    };

    const openDayModal = (day = null) => {
        if (day) {
            const placesForDay = dailyPlaces.filter(p => p.tour_day_id === day.id);
            setEditingDay({ 
                ...day, 
                places: placesForDay,
                lunch_restaurant_id: day.lunch_restaurant_id || '',
                dinner_restaurant_id: day.dinner_restaurant_id || ''
            });
        } else {
            setEditingDay({
                id: 'new', tour_id: activeTourId, date: '', weather_city_name: '', route_map_embed_url: '',
                wake_up_time: '', breakfast_time: '', suitcase_pickup_time: '', departure_time: '',
                hotel_arrival_time: '', dinner_time: '', free_time_start: '', hotel_id: '',
                lunch_restaurant_id: '', dinner_restaurant_id: '', places: []
            });
        }
        setIsModalOpen(true);
    };

    const closeDayModal = () => {
        setIsModalOpen(false);
        setEditingDay(null);
    };

    const handleSaveDay = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving Tour Day...');

        try {
            let currentDayId = editingDay.id;

            const dayPayload = {
                tour_id: activeTourId, date: editingDay.date, weather_city_name: editingDay.weather_city_name,
                route_map_embed_url: editingDay.route_map_embed_url, wake_up_time: editingDay.wake_up_time,
                breakfast_time: editingDay.breakfast_time, suitcase_pickup_time: editingDay.suitcase_pickup_time,
                departure_time: editingDay.departure_time, hotel_arrival_time: editingDay.hotel_arrival_time,
                dinner_time: editingDay.dinner_time, free_time_start: editingDay.free_time_start,
                hotel_id: editingDay.hotel_id || null, lunch_restaurant_id: editingDay.lunch_restaurant_id || null,
                dinner_restaurant_id: editingDay.dinner_restaurant_id || null
            };

            if (currentDayId === 'new') {
                const { data: newDay, error } = await supabase.from('tour_days').insert([dayPayload]).select().single();
                if (error) throw error;
                currentDayId = newDay.id;
            } else {
                const { error } = await supabase.from('tour_days').update(dayPayload).eq('id', currentDayId);
                if (error) throw error;
            }

            if (currentDayId !== 'new') {
                await supabase.from('daily_places').delete().eq('tour_day_id', currentDayId);
            }

            if (editingDay.places.length > 0) {
                const placesPayload = editingDay.places.map(p => ({
                    tour_day_id: currentDayId, place_name: p.place_name, image_url: p.image_url
                }));
                const { error: placesErr } = await supabase.from('daily_places').insert(placesPayload);
                if (placesErr) throw placesErr;
            }

            toast.success('Tour Day Saved!', { id: toastId });
            closeDayModal();
            fetchAllData(); 

        } catch (error) {
            toast.error('Failed to save day.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    // --- REPLACED WINDOW.CONFIRM WITH CUSTOM MODAL FOR DELETING DAY ---
    const handleDeleteDay = () => {
        if (editingDay.id === 'new') return;
        
        // Open the custom modal
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Tour Day?',
            message: `Are you sure you want to delete the itinerary for ${editingDay.date || 'this day'}? This cannot be undone.`,
            onConfirm: async () => {
                const toastId = toast.loading('Deleting day...');
                try {
                    await supabase.from('daily_places').delete().eq('tour_day_id', editingDay.id);
                    const { error } = await supabase.from('tour_days').delete().eq('id', editingDay.id);
                    if (error) throw error;
                    
                    toast.success('Day deleted permanently.', { id: toastId });
                    closeDayModal();
                    fetchAllData();
                } catch (error) {
                    toast.error('Failed to delete.', { id: toastId });
                }
            }
        });
    };

    const handleSaveTravelers = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving Travelers...');

        try {
            const validTravelers = travelers.filter(t => t.name.trim() !== '');
            const newTravelers = validTravelers.filter(t => typeof t.id === 'string' && t.id.startsWith('new_'));
            const existingTravelers = validTravelers.filter(t => typeof t.id !== 'string' || !t.id.startsWith('new_'));

            if (newTravelers.length > 0) {
                const { error } = await supabase.from('travelers').insert(
                    newTravelers.map(t => ({ tour_id: activeTourId, name: t.name, departure_pickup_time: t.departure_pickup_time, departure_flight_time: t.departure_flight_time }))
                );
                if (error) throw error;
            }

            if (existingTravelers.length > 0) {
                const { error } = await supabase.from('travelers').upsert(
                    existingTravelers.map(t => ({ id: t.id, tour_id: activeTourId, name: t.name, departure_pickup_time: t.departure_pickup_time, departure_flight_time: t.departure_flight_time })), { onConflict: 'id' }
                );
                if (error) throw error;
            }

            toast.success('Travelers Saved!', { id: toastId });
            fetchAllData();
        } catch (error) {
            toast.error('Failed to save travelers.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDayFieldChange = (field, value) => setEditingDay(prev => ({ ...prev, [field]: value }));
    const addPlace = () => setEditingDay(prev => ({ ...prev, places: [...prev.places, { place_name: '', image_url: '' }] }));
    const updatePlace = (index, field, value) => {
        const updatedPlaces = [...editingDay.places];
        updatedPlaces[index][field] = value;
        setEditingDay(prev => ({ ...prev, places: updatedPlaces }));
    };
    const removePlace = (index) => setEditingDay(prev => ({ ...prev, places: editingDay.places.filter((_, i) => i !== index) }));
    const addTraveler = () => setTravelers(prev => [...prev, { id: `new_${Date.now()}`, name: '', departure_pickup_time: '', departure_flight_time: '' }]);
    const updateTraveler = (index, field, value) => {
        const updated = [...travelers];
        updated[index][field] = value;
        setTravelers(updated);
    };

    // --- REPLACED WINDOW.CONFIRM WITH CUSTOM MODAL FOR DELETING TRAVELER ---
    const removeTraveler = (index, travelerId) => {
        if (typeof travelerId !== 'string' || !travelerId.startsWith('new_')) {
            // Open custom modal
            setConfirmConfig({
                isOpen: true,
                title: 'Remove Traveler?',
                message: 'Are you sure you want to permanently remove this traveler from the database?',
                onConfirm: async () => {
                    await supabase.from('travelers').delete().eq('id', travelerId);
                    setTravelers(prev => prev.filter((_, i) => i !== index));
                    toast.success('Traveler removed.');
                }
            });
        } else {
            setTravelers(prev => prev.filter((_, i) => i !== index));
        }
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '10vh' }}>Loading Form...</div>;

    return (
        <div className="admin-edit-wrapper">
            
            {/* INJECT CUSTOM MODAL COMPONENT */}
            <ConfirmModal 
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
            />

            <div className="admin-edit-header">
                <h1>Daily Itineraries</h1>
                <p>Manage the daily schedule, places visited, and your travelers' departure info.</p>
            </div>

            {/* --- DAY CARDS GRID --- */}
            <div className="days-grid">
                {tourDays.map((day, index) => (
                    <div key={day.id} className="day-card" onClick={() => openDayModal(day)}>
                        <h3>Day {index + 1}</h3>
                        <span className="day-date">{day.date || 'No Date Set'}</span>
                        <p>📍 {day.weather_city_name || 'No City Set'}</p>
                        <button className="edit-card-btn">Edit Day Details</button>
                    </div>
                ))}
                
                <div className="day-card create-new" onClick={() => openDayModal()}>
                    <h3>+</h3>
                    <span>Create New Tour Day</span>
                </div>
            </div>

            {/* --- TRAVELERS SECTION --- */}
            <form className="edit-form-card" style={{ marginTop: '3rem' }} onSubmit={handleSaveTravelers}>
                <div className="form-section">
                    <h3>Travelers & Departure Information</h3>
                    <p className="hint-text">Add your travelers here. Use the clear headers to manage final day logistics.</p>
                    
                    {travelers.length > 0 && (
                        <div className="traveler-header-row">
                            <div className="traveler-header-cell">#</div>
                            <div className="traveler-header-cell">Traveler Name</div>
                            <div className="traveler-header-cell">Pickup Time</div>
                            <div className="traveler-header-cell">Flight Time</div>
                            <div className="traveler-header-cell" style={{textAlign: 'center'}}></div>
                        </div>
                    )}

                    {travelers.map((t, index) => (
                        <div key={t.id} className="traveler-row">
                            <div className="traveler-number">{index + 1}</div>
                            <input type="text" placeholder="Name" value={t.name} onChange={e => updateTraveler(index, 'name', e.target.value)} />
                            <input type="time" value={t.departure_pickup_time || ''} onChange={e => updateTraveler(index, 'departure_pickup_time', e.target.value)} />
                            <input type="time" value={t.departure_flight_time || ''} onChange={e => updateTraveler(index, 'departure_flight_time', e.target.value)} />
                            <button type="button" className="btn-remove-small" onClick={() => removeTraveler(index, t.id)}>X</button>
                        </div>
                    ))}
                    
                    <button type="button" className="btn-add-secondary" onClick={addTraveler}>+ Add Traveler</button>
                </div>
                <button type="submit" className="save-button" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Travelers List'}
                </button>
            </form>

            {/* --- THE EDIT DAY MODAL --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeDayModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        
                        <div className="modal-header">
                            <h2>{editingDay.id === 'new' ? 'Create Tour Day' : `Edit Date: ${editingDay.date}`}</h2>
                            <button className="close-modal" onClick={closeDayModal}>×</button>
                        </div>

                        <form className="modal-form-body" onSubmit={handleSaveDay}>
                            
                            <div className="form-section">
                                <h3>General Day Info</h3>
                                <div className="input-row">
                                    <div><label>Date of this Day</label><input type="date" required value={editingDay.date} onChange={e => handleDayFieldChange('date', e.target.value)} /></div>
                                    <div><label>City (For Weather API)</label><input type="text" placeholder="e.g. Istanbul" value={editingDay.weather_city_name} onChange={e => handleDayFieldChange('weather_city_name', e.target.value)} /></div>
                                </div>
                                <div style={{ marginTop: '1rem' }}><label>Google My Maps Embed URL</label><input type="text" value={editingDay.route_map_embed_url} onChange={e => handleDayFieldChange('route_map_embed_url', e.target.value)} /></div>
                            </div>

                            <div className="form-section">
                                <h3>Daily Schedule</h3>
                                <div className="input-row">
                                    <div><label>Wake Up Time</label><input type="time" value={editingDay.wake_up_time || ''} onChange={e => handleDayFieldChange('wake_up_time', e.target.value)} /></div>
                                    <div><label>Breakfast Time</label><input type="time" value={editingDay.breakfast_time || ''} onChange={e => handleDayFieldChange('breakfast_time', e.target.value)} /></div>
                                </div>
                                <div className="input-row" style={{ marginTop: '1rem' }}>
                                    <div><label>Suitcase Pickup</label><input type="time" value={editingDay.suitcase_pickup_time || ''} onChange={e => handleDayFieldChange('suitcase_pickup_time', e.target.value)} /></div>
                                    <div><label>Departure Time</label><input type="time" value={editingDay.departure_time || ''} onChange={e => handleDayFieldChange('departure_time', e.target.value)} /></div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Meals & Accommodation</h3>
                                <div className="input-row">
                                    <div><label>Hotel Arrival Time</label><input type="time" value={editingDay.hotel_arrival_time || ''} onChange={e => handleDayFieldChange('hotel_arrival_time', e.target.value)} /></div>
                                    <div><label>Free Time Begins</label><input type="time" value={editingDay.free_time_start || ''} onChange={e => handleDayFieldChange('free_time_start', e.target.value)} /></div>
                                </div>
                                <div className="input-row" style={{ marginTop: '1rem' }}>
                                    <div><label>Dinner Time</label><input type="time" value={editingDay.dinner_time || ''} onChange={e => handleDayFieldChange('dinner_time', e.target.value)} /></div>
                                    <div>
                                        <label>Select Hotel</label>
                                        <select value={editingDay.hotel_id || ''} onChange={e => handleDayFieldChange('hotel_id', e.target.value)}>
                                            <option value="">-- No Hotel --</option>
                                            {hotelsRoster.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="input-row" style={{ marginTop: '1rem' }}>
                                    <div>
                                        <label>Lunch Restaurant</label>
                                        <select value={editingDay.lunch_restaurant_id || ''} onChange={e => handleDayFieldChange('lunch_restaurant_id', e.target.value)}>
                                            <option value="">-- No Specific Lunch --</option>
                                            {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label>Dinner Restaurant</label>
                                        <select value={editingDay.dinner_restaurant_id || ''} onChange={e => handleDayFieldChange('dinner_restaurant_id', e.target.value)}>
                                            <option value="">-- No Specific Dinner --</option>
                                            {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Places Visited Today</h3>
                                {editingDay.places.map((place, index) => (
                                    <div key={index} className="place-edit-row">
                                        <input type="text" placeholder="Place Name" value={place.place_name} onChange={e => updatePlace(index, 'place_name', e.target.value)} />
                                        <input type="text" placeholder="Image URL" value={place.image_url} onChange={e => updatePlace(index, 'image_url', e.target.value)} />
                                        <button type="button" className="btn-remove-small" onClick={() => removePlace(index)}>X</button>
                                    </div>
                                ))}
                                <button type="button" className="btn-add-secondary" onClick={addPlace}>+ Add Place</button>
                            </div>

                            <div className="modal-action-bar">
                                {editingDay.id !== 'new' && (
                                    <button type="button" className="btn-danger-modal" onClick={handleDeleteDay}>Delete Entire Day</button>
                                )}
                                <button type="submit" className="save-button-modal" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Tour Day'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDailyInfoEdit;