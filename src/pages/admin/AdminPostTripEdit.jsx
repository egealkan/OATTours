import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/extras/ConfirmModal';
import ImageUpload from '../../components/extras/ImageUpload';
import './AdminPostTripEdit.css';

const AdminPostTripEdit = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [activeTourId, setActiveTourId] = useState(null);
    const [hotelsRoster, setHotelsRoster] = useState([]);
    const [restaurantsRoster, setRestaurantsRoster] = useState([]);

    const [postTripDays, setPostTripDays] = useState([]);
    const [dailyPlaces, setDailyPlaces] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDay, setEditingDay] = useState(null);

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });
    const [mapLinks, setMapLinks] = useState([]);
    const [newMapName, setNewMapName] = useState('');
    const [newMapUrl, setNewMapUrl] = useState('');

    const [editingMapId, setEditingMapId] = useState(null);
    const [editMapData, setEditMapData] = useState({ name: '', embed_url: '' });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const { data: activeTour } = await supabase
                .from('tours')
                .select('id')
                .eq('is_active', true)
                .single();

            if (!activeTour) {
                toast.error("No active tour found. Please create one first.");
                setIsLoading(false);
                return;
            }
            setActiveTourId(activeTour.id);

            const { data: hotels } = await supabase.from('hotels').select('*');
            if (hotels) setHotelsRoster(hotels);

            const { data: restaurants } = await supabase.from('restaurants').select('*');
            if (restaurants) setRestaurantsRoster(restaurants);

            const { data: days } = await supabase
                .from('tour_days')
                .select('*')
                .eq('tour_id', activeTour.id)
                .eq('is_post_trip', true)
                .order('date', { ascending: true });
            if (days) setPostTripDays(days);

            const { data: places } = await supabase.from('daily_places').select('*');
            if (places) setDailyPlaces(places);

            const { data: maps } = await supabase.from('map_links').select('*').order('name');
            if (maps) setMapLinks(maps);

        } catch (error) {
            toast.error("Error loading database information.");
            console.error(error);
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
                id: 'new', tour_id: activeTourId, is_post_trip: true,
                date: '', weather_city_name: '', route_map_embed_url: '',
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
        const toastId = toast.loading('Saving Post Trip Day...');

        try {
            let currentDayId = editingDay.id;

            const dayPayload = {
                tour_id: activeTourId || null,
                is_post_trip: true,
                date: editingDay.date || null,
                weather_city_name: editingDay.weather_city_name || null,
                route_map_embed_url: editingDay.route_map_embed_url || null,
                wake_up_time: editingDay.wake_up_time || null,
                breakfast_time: editingDay.breakfast_time || null,
                suitcase_pickup_time: editingDay.suitcase_pickup_time || null,
                departure_time: editingDay.departure_time || null,
                hotel_arrival_time: editingDay.hotel_arrival_time || null,
                dinner_time: editingDay.dinner_time || null,
                free_time_start: editingDay.free_time_start || null,
                hotel_id: editingDay.hotel_id || null,
                lunch_restaurant_id: editingDay.lunch_restaurant_id || null,
                dinner_restaurant_id: editingDay.dinner_restaurant_id || null
            };

            if (currentDayId === 'new') {
                const { data: newDay, error } = await supabase
                    .from('tour_days')
                    .insert([dayPayload])
                    .select()
                    .single();
                if (error) throw error;
                currentDayId = newDay.id;
            } else {
                const { error } = await supabase
                    .from('tour_days')
                    .update(dayPayload)
                    .eq('id', currentDayId);
                if (error) throw error;
            }

            await supabase.from('daily_places').delete().eq('tour_day_id', currentDayId);

            if (editingDay.places.length > 0) {
                const placesPayload = editingDay.places.map(p => ({
                    tour_day_id: currentDayId,
                    place_name: p.place_name,
                    image_url: p.image_url
                }));
                const { error: placesErr } = await supabase.from('daily_places').insert(placesPayload);
                if (placesErr) throw placesErr;
            }

            toast.success('Post Trip Day Saved!', { id: toastId });
            closeDayModal();
            fetchAllData();

        } catch (error) {
            toast.error('Failed to save day.', { id: toastId });
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDay = () => {
        if (editingDay.id === 'new') return;

        setConfirmConfig({
            isOpen: true,
            title: 'Delete Post Trip Day?',
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

    const handleDayFieldChange = (field, value) =>
        setEditingDay(prev => ({ ...prev, [field]: value }));

    const addPlace = () =>
        setEditingDay(prev => ({ ...prev, places: [...prev.places, { place_name: '', image_url: '' }] }));

    const updatePlace = (index, field, value) => {
        const updatedPlaces = [...editingDay.places];
        updatedPlaces[index][field] = value;
        setEditingDay(prev => ({ ...prev, places: updatedPlaces }));
    };

    const removePlace = (index) =>
        setEditingDay(prev => ({ ...prev, places: editingDay.places.filter((_, i) => i !== index) }));


    const handleAddMapLink = async () => {
        if (!newMapName.trim() || !newMapUrl.trim()) {
            toast.error('Please provide both a name and a URL.');
            return;
        }
        const { data, error } = await supabase
            .from('map_links')
            .insert([{ name: newMapName.trim(), embed_url: newMapUrl.trim() }])
            .select()
            .single();
        if (error) { toast.error('Failed to add map link.'); return; }
        setMapLinks(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setNewMapName('');
        setNewMapUrl('');
        toast.success('Map link added!');
    };
    
    const handleDeleteMapLink = (mapId, mapName) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Map Link?',
            message: `Are you sure you want to delete "${mapName}" from the library?`,
            onConfirm: async () => {
                const { error } = await supabase.from('map_links').delete().eq('id', mapId);
                if (error) { toast.error('Failed to delete.'); return; }
                setMapLinks(prev => prev.filter(m => m.id !== mapId));
                toast.success('Map link deleted.');
            }
        });
    };

    const handleStartEditMap = (map) => {
        setEditingMapId(map.id);
        setEditMapData({ name: map.name, embed_url: map.embed_url });
    };

    const handleCancelEditMap = () => {
        setEditingMapId(null);
        setEditMapData({ name: '', embed_url: '' });
    };

    const handleSaveEditMap = async () => {
        if (!editMapData.name.trim() || !editMapData.embed_url.trim()) {
            toast.error('Name and URL cannot be empty.');
            return;
        }
        
        const toastId = toast.loading('Saving map...');
        const { error } = await supabase
            .from('map_links')
            .update({ name: editMapData.name.trim(), embed_url: editMapData.embed_url.trim() })
            .eq('id', editingMapId);

        if (error) {
            toast.error('Failed to update map.', { id: toastId });
            return;
        }

        setMapLinks(prev => prev.map(m => 
            m.id === editingMapId ? { ...m, name: editMapData.name.trim(), embed_url: editMapData.embed_url.trim() } : m
        ));
        
        toast.success('Map updated!', { id: toastId });
        setEditingMapId(null);
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
                <h1>Post Trip Itineraries</h1>
                <p>Manage the day-by-day schedule and places visited after the main tour ends.</p>
            </div>

            {/* --- POST TRIP DAY CARDS GRID --- */}
            <div className="days-grid">
                {postTripDays.map((day, index) => (
                    <div key={day.id} className="day-card post-trip-card" onClick={() => openDayModal(day)}>
                        <h3>Post Trip Day {index + 1}</h3>
                        <span className="day-date">{day.date || 'No Date Set'}</span>
                        <p>📍 {day.weather_city_name || 'No City Set'}</p>
                        <button className="edit-card-btn">Edit Day Details</button>
                    </div>
                ))}

                <div className="day-card create-new" onClick={() => openDayModal()}>
                    <h3>+</h3>
                    <span>Create New Post Trip Day</span>
                </div>
            </div>


            {/* MAP LIBRARY */}
            <div className="edit-form-card" style={{ marginTop: '2rem' }}>
                <div className="form-section">
                    <h3>Map Library</h3>
                    <p className="hint-text">
                        Save your Google My Maps embed URLs here once. When editing a day, select the right map from the dropdown instead of pasting the URL each time.
                    </p>

                    {mapLinks.length > 0 && (
                        <div className="map-links-list">
                            {mapLinks.map(map => (
                                <div key={map.id} className="map-link-row map-list-item">
                                    {editingMapId === map.id ? (
                                        <div className="map-edit-mode">
                                            <input
                                                type="text"
                                                value={editMapData.name}
                                                onChange={(e) => setEditMapData({ ...editMapData, name: e.target.value })}
                                                placeholder="Map Name"
                                            />
                                            <input
                                                type="text"
                                                value={editMapData.embed_url}
                                                onChange={(e) => setEditMapData({ ...editMapData, embed_url: e.target.value })}
                                                placeholder="Embed URL"
                                            />
                                            <div className="map-edit-actions">
                                                <button type="button" className="btn-add-secondary inline-btn" onClick={handleSaveEditMap}>Save</button>
                                                <button type="button" className="btn-danger-modal inline-btn" onClick={handleCancelEditMap}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="map-text-container">
                                                <span className="map-link-name">🗺️ {map.name}</span>
                                                <span className="map-link-preview">{map.embed_url}</span>
                                            </div>
                                            <div className="map-action-buttons">
                                                <button
                                                    type="button"
                                                    className="edit-card-btn inline-btn"
                                                    onClick={() => handleStartEditMap(map)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-remove-small inline-btn"
                                                    onClick={() => handleDeleteMapLink(map.id, map.name)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="input-row" style={{ marginTop: mapLinks.length > 0 ? '1.5rem' : '0' }}>
                        <div>
                            <label>Map Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Istanbul Day Route"
                                value={newMapName}
                                onChange={e => setNewMapName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Embed URL</label>
                            <input
                                type="text"
                                placeholder="https://www.google.com/maps/d/embed?..."
                                value={newMapUrl}
                                onChange={e => setNewMapUrl(e.target.value)}
                            />
                        </div>
                    </div>
                    <button type="button" className="btn-add-secondary" onClick={handleAddMapLink}>
                        + Add to Map Library
                    </button>
                </div>
            </div>




            {/* --- THE EDIT DAY MODAL --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeDayModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>

                        <div className="modal-header">
                            <h2>
                                {editingDay.id === 'new'
                                    ? 'Create Post Trip Day'
                                    : `Edit Post Trip Day: ${editingDay.date}`}
                            </h2>
                            <button className="close-modal" onClick={closeDayModal}>×</button>
                        </div>

                        <form className="modal-form-body" onSubmit={handleSaveDay}>

                            <div className="form-section">
                                <h3>General Day Info</h3>
                                <div className="input-row">
                                    <div>
                                        <label>Date of this Day</label>
                                        <input
                                            type="date"
                                            value={editingDay.date}
                                            onChange={e => handleDayFieldChange('date', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label>City (For Weather API)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Istanbul"
                                            value={editingDay.weather_city_name}
                                            onChange={e => handleDayFieldChange('weather_city_name', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <label>Route Map</label>
                                    <select
                                        value={editingDay.route_map_embed_url || ''}
                                        onChange={e => handleDayFieldChange('route_map_embed_url', e.target.value)}
                                    >
                                        <option value="">-- No Map --</option>
                                        {mapLinks.map(m => (
                                            <option key={m.id} value={m.embed_url}>{m.name}</option>
                                        ))}
                                    </select>
                                    {mapLinks.length === 0 && (
                                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '6px', fontStyle: 'italic' }}>
                                            No maps in library yet — add them in the Map Library section below.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Daily Schedule</h3>
                                <div className="input-row">
                                    <div>
                                        <label>Wake Up Time</label>
                                        <input type="time" value={editingDay.wake_up_time || ''} onChange={e => handleDayFieldChange('wake_up_time', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Breakfast Time</label>
                                        <input type="time" value={editingDay.breakfast_time || ''} onChange={e => handleDayFieldChange('breakfast_time', e.target.value)} />
                                    </div>
                                </div>
                                <div className="input-row" style={{ marginTop: '1rem' }}>
                                    <div>
                                        <label>Suitcase Pickup</label>
                                        <input type="time" value={editingDay.suitcase_pickup_time || ''} onChange={e => handleDayFieldChange('suitcase_pickup_time', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Departure Time</label>
                                        <input type="time" value={editingDay.departure_time || ''} onChange={e => handleDayFieldChange('departure_time', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Meals & Accommodation</h3>
                                <div className="input-row">
                                    <div>
                                        <label>Hotel Arrival Time</label>
                                        <input type="time" value={editingDay.hotel_arrival_time || ''} onChange={e => handleDayFieldChange('hotel_arrival_time', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Free Time Begins</label>
                                        <input type="time" value={editingDay.free_time_start || ''} onChange={e => handleDayFieldChange('free_time_start', e.target.value)} />
                                    </div>
                                </div>
                                <div className="input-row" style={{ marginTop: '1rem' }}>
                                    <div>
                                        <label>Dinner Time</label>
                                        <input type="time" value={editingDay.dinner_time || ''} onChange={e => handleDayFieldChange('dinner_time', e.target.value)} />
                                    </div>
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
                                    <div key={index} className="place-edit-block">
                                        <div className="place-edit-name-row">
                                            <input
                                                type="text"
                                                placeholder="Place Name"
                                                value={place.place_name}
                                                onChange={e => updatePlace(index, 'place_name', e.target.value)}
                                            />
                                            <button type="button" className="btn-remove-small" onClick={() => removePlace(index)}>X</button>
                                        </div>
                                        <ImageUpload
                                            currentUrl={place.image_url}
                                            onUpload={(url) => updatePlace(index, 'image_url', url)}
                                            folder="places"
                                            label={`Photo for "${place.place_name || 'this place'}"`}
                                        />
                                    </div>
                                ))}
                                <button type="button" className="btn-add-secondary" onClick={addPlace}>+ Add Place</button>
                            </div>

                            <div className="modal-action-bar">
                                {editingDay.id !== 'new' && (
                                    <button type="button" className="btn-danger-modal" onClick={handleDeleteDay}>
                                        Delete Entire Day
                                    </button>
                                )}
                                <button type="submit" className="save-button-modal" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Post Trip Day'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPostTripEdit;