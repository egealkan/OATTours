import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/extras/ConfirmModal';
import './AdminFarewellEdit.css';

const AdminFarewellEdit = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Core Tour ID
    const [activeTourId, setActiveTourId] = useState(null);

    // Dictionaries for dropdowns
    const [restaurantsRoster, setRestaurantsRoster] = useState([]);

    // --- FORM STATES ---
    const [tourData, setTourData] = useState({
        farewell_meeting_time: '',
        farewell_dinner_restaurant_id: '',
        learning_and_discoveries: '',
        controversial_topic: '',
        goodbye_message: ''
    });

    const [travelers, setTravelers] = useState([]);
    const [itinerarySummary, setItinerarySummary] = useState([]); // Read-only summary

    // Custom Confirm Dialog State
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
            // 1. Fetch Active Tour
            const { data: activeTour } = await supabase.from('tours').select('*').eq('is_active', true).single();
            if (activeTour) {
                setActiveTourId(activeTour.id);
                setTourData({
                    farewell_meeting_time: activeTour.farewell_meeting_time || '',
                    farewell_dinner_restaurant_id: activeTour.farewell_dinner_restaurant_id || '',
                    learning_and_discoveries: activeTour.learning_and_discoveries || '',
                    controversial_topic: activeTour.controversial_topic || '',
                    goodbye_message: activeTour.goodbye_message || ''
                });

                // 2. Fetch Travelers for this tour
                const { data: tourTravelers } = await supabase.from('travelers').select('*').eq('tour_id', activeTour.id);
                if (tourTravelers) setTravelers(tourTravelers);

                // 3. Auto-Generate Itinerary Summary (Fetch days, then fetch places)
                const { data: days } = await supabase.from('tour_days').select('id').eq('tour_id', activeTour.id);
                if (days && days.length > 0) {
                    const dayIds = days.map(d => d.id);
                    const { data: places } = await supabase.from('daily_places').select('place_name').in('tour_day_id', dayIds);
                    
                    if (places) {
                        // Filter out our "virtual" meal tags
                        const validPlaces = places
                            .filter(p => p.place_name !== 'LUNCH_RESTAURANT' && p.place_name !== 'DINNER_RESTAURANT')
                            .map(p => p.place_name);
                        
                        // Remove duplicates so places visited multiple times only show once
                        const uniquePlaces = [...new Set(validPlaces)];
                        setItinerarySummary(uniquePlaces);
                    }
                }
            } else {
                toast.error("No active tour found. Please create one first.");
            }

            // 4. Fetch Restaurants Dictionary
            const { data: restaurants } = await supabase.from('restaurants').select('*');
            if (restaurants) setRestaurantsRoster(restaurants);

        } catch (error) {
            toast.error("Error loading database information.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAll = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving Farewell Information...');

        try {
            // 1. Save Tour Info
            if (activeTourId) {
                const { error: tourErr } = await supabase.from('tours').update(tourData).eq('id', activeTourId);
                if (tourErr) throw tourErr;
            }

            // 2. Save Travelers
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

            toast.success('Farewell Information Saved!', { id: toastId });
            fetchAllData(); 

        } catch (error) {
            console.error(error);
            toast.error('Failed to save changes.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTourDataChange = (field, value) => {
        setTourData(prev => ({ ...prev, [field]: value }));
    };

    // --- TRAVELER HELPERS ---
    const addTraveler = () => setTravelers(prev => [...prev, { id: `new_${Date.now()}`, name: '', departure_pickup_time: '', departure_flight_time: '' }]);
    const updateTraveler = (index, field, value) => {
        const updated = [...travelers];
        updated[index][field] = value;
        setTravelers(updated);
    };

    const removeTraveler = (index, travelerId) => {
        if (typeof travelerId !== 'string' || !travelerId.startsWith('new_')) {
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
            
            <ConfirmModal 
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
            />

            <div className="admin-edit-header">
                <h1>Edit Farewell Information</h1>
                <p>Manage final day details, wrap-up discussions, and departure logistics.</p>
            </div>

            <form className="edit-form-card" onSubmit={handleSaveAll}>
                
                {/* 1. FAREWELL DINNER */}
                <div className="form-section">
                    <h3>Farewell Dinner</h3>
                    <div className="input-row">
                        <div>
                            <label>Farewell Dinner Restaurant</label>
                            <select value={tourData.farewell_dinner_restaurant_id} onChange={e => handleTourDataChange('farewell_dinner_restaurant_id', e.target.value)}>
                                <option value="">-- Select Restaurant --</option>
                                {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Meeting Time</label>
                            <input type="time" value={tourData.farewell_meeting_time} onChange={e => handleTourDataChange('farewell_meeting_time', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* 2. DISCUSSIONS & GOODBYE */}
                <div className="form-section">
                    <h3>Discussions & Memories</h3>
                    <p className="hint-text">These are specific to this tour group and will be overwritten on your next tour.</p>
                    
                    <div>
                        <label>Learning & Discoveries (Extra places, daily life changes)</label>
                        <textarea 
                            value={tourData.learning_and_discoveries} 
                            onChange={e => handleTourDataChange('learning_and_discoveries', e.target.value)}
                            placeholder="What did we learn on this trip?"
                        />
                    </div>
                    
                    <div style={{ marginTop: '1rem' }}>
                        <label>Controversial Topic Discussed</label>
                        <textarea 
                            value={tourData.controversial_topic} 
                            onChange={e => handleTourDataChange('controversial_topic', e.target.value)}
                            placeholder="Summarize the controversial topic discussed..."
                            style={{ minHeight: '80px' }}
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <label>Goodbye Message</label>
                        <textarea 
                            value={tourData.goodbye_message} 
                            onChange={e => handleTourDataChange('goodbye_message', e.target.value)}
                            placeholder="Your final words to the group..."
                            style={{ minHeight: '100px' }}
                        />
                    </div>
                </div>

                {/* 3. AUTO-GENERATED ITINERARY PREVIEW */}
                <div className="form-section">
                    <h3>Summary of Itinerary (Auto-Generated Preview)</h3>
                    <p className="hint-text">This list is automatically compiled from the places you entered in the Daily Itineraries.</p>
                    {itinerarySummary.length > 0 ? (
                        <div className="itinerary-tags-container">
                            {itinerarySummary.map((place, index) => (
                                <span key={index} className="itinerary-tag">{place}</span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No places have been added to the Daily Itineraries yet.</p>
                    )}
                </div>

                {/* 4. TRAVELERS DEPARTURE LOGISTICS */}
                <div className="form-section">
                    <h3>Travelers & Departure Information</h3>
                    <p className="hint-text">You can verify or update final flight and pickup times here.</p>
                    
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
                    {isSaving ? 'Saving...' : 'Save Farewell Information'}
                </button>
            </form>
        </div>
    );
};

export default AdminFarewellEdit;