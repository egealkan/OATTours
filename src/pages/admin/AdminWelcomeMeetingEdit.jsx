// import React, { useState, useEffect } from 'react';
// import { supabase } from '../../services/supabaseClient';
// import toast from 'react-hot-toast';
// import ConfirmModal from '../../components/extras/ConfirmModal';
// import ImageUpload from '../../components/extras/ImageUpload';
// import './AdminWelcomeMeetingEdit.css';

// const AdminWelcomeMeetingEdit = () => {
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);
    
//     const [activeTourId, setActiveTourId] = useState(null);
//     const [hotelsRoster, setHotelsRoster] = useState([]);
//     const [restaurantsRoster, setRestaurantsRoster] = useState([]);

//     const [guideData, setGuideData] = useState({ id: 1, name: '', about_me: '', years_at_oat: '', profile_image_url: '' });
    
//     const [tourData, setTourData] = useState({
//         general_trip_info: '', gullet_name: '', gullet_direction: 'Fethiye to Marmaris',
//         welcome_dinner_restaurant_id: '', farewell_dinner_restaurant_id: '',
//         home_hosted_village: '', home_hosted_family_names: '', day_in_life_activity: '',
//         domestic_flight_airport: '', domestic_flight_city: '', domestic_flight_date: '', domestic_flight_time: ''
//     });

//     const [editingHotel, setEditingHotel] = useState({ id: 'new', name: '', description: '', image_url: '' });
//     const [editingRestaurant, setEditingRestaurant] = useState({ id: 'new', name: '' });

//     const [confirmConfig, setConfirmConfig] = useState({
//         isOpen: false, title: '', message: '', onConfirm: () => {}
//     });

//     useEffect(() => { fetchAllData(); }, []);

//     const fetchAllData = async () => {
//         setIsLoading(true);
//         try {
//             const { data: activeTour } = await supabase.from('tours').select('*').eq('is_active', true).single();
//             if (activeTour) {
//                 setActiveTourId(activeTour.id);
//                 setTourData({
//                     general_trip_info: activeTour.general_trip_info || '', gullet_name: activeTour.gullet_name || '',
//                     gullet_direction: activeTour.gullet_direction || 'Fethiye to Marmaris',
//                     welcome_dinner_restaurant_id: activeTour.welcome_dinner_restaurant_id || '',
//                     farewell_dinner_restaurant_id: activeTour.farewell_dinner_restaurant_id || '',
//                     home_hosted_village: activeTour.home_hosted_village || '',
//                     home_hosted_family_names: activeTour.home_hosted_family_names || '',
//                     day_in_life_activity: activeTour.day_in_life_activity || '',
//                     domestic_flight_airport: activeTour.domestic_flight_airport || '',
//                     domestic_flight_city: activeTour.domestic_flight_city || '',
//                     domestic_flight_date: activeTour.domestic_flight_date || '',
//                     domestic_flight_time: activeTour.domestic_flight_time || ''
//                 });
//             }

//             const { data: guide } = await supabase.from('guide_profile').select('*').eq('id', 1).single();
//             if (guide) setGuideData(guide);

//             const { data: hotels } = await supabase.from('hotels').select('*');
//             if (hotels) setHotelsRoster(hotels);

//             const { data: restaurants } = await supabase.from('restaurants').select('*');
//             if (restaurants) setRestaurantsRoster(restaurants);

//         } catch (error) {
//             toast.error("Error loading database information.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleDeleteItem = (table, itemState, setItemState, rosterSetter) => {
//         if (itemState.id === 'new') return;
        
//         setConfirmConfig({
//             isOpen: true,
//             title: `Delete ${table === 'hotels' ? 'Hotel' : 'Restaurant'}?`,
//             message: `Are you sure you want to permanently delete ${itemState.name}?`,
//             onConfirm: async () => {
//                 const toastId = toast.loading('Deleting...');
//                 try {
//                     const { error } = await supabase.from(table).delete().eq('id', itemState.id);
//                     if (error) throw error;
//                     toast.success('Deleted permanently.', { id: toastId });
//                     rosterSetter(prev => prev.filter(i => i.id !== itemState.id));
//                     if (table === 'hotels') setItemState({ id: 'new', name: '', description: '', image_url: '' });
//                     if (table === 'restaurants') setItemState({ id: 'new', name: '' });
//                 } catch (error) {
//                     toast.error('Failed to delete item.', { id: toastId });
//                 }
//             }
//         });
//     };

//     const handleSaveAll = async (e) => {
//         e.preventDefault();
//         setIsSaving(true);
//         const toastId = toast.loading('Saving Meeting Info & Dictionaries...');

//         try {
//             if (activeTourId) {
//                 const { error: tourErr } = await supabase.from('tours').update(tourData).eq('id', activeTourId);
//                 if (tourErr) throw tourErr;
//             } else {
//                 const { data: newTour, error: insertTourErr } = await supabase.from('tours').insert([{ ...tourData, is_active: true }]).select().single();
//                 if (insertTourErr) throw insertTourErr;
//                 if (newTour) setActiveTourId(newTour.id);
//             }

//             const { error: guideErr } = await supabase.from('guide_profile').upsert(guideData, { onConflict: 'id' });
//             if (guideErr) throw guideErr;

//             if (editingHotel.name.trim() !== '') {
//                 if (editingHotel.id === 'new') {
//                     const { error } = await supabase.from('hotels').insert([{ name: editingHotel.name, description: editingHotel.description, image_url: editingHotel.image_url }]);
//                     if (error) throw error;
//                 } else {
//                     const { error } = await supabase.from('hotels').update({ name: editingHotel.name, description: editingHotel.description, image_url: editingHotel.image_url }).eq('id', editingHotel.id);
//                     if (error) throw error;
//                 }
//             }

//             if (editingRestaurant.name.trim() !== '') {
//                 if (editingRestaurant.id === 'new') {
//                     const { error } = await supabase.from('restaurants').insert([{ name: editingRestaurant.name }]);
//                     if (error) throw error;
//                 } else {
//                     const { error } = await supabase.from('restaurants').update({ name: editingRestaurant.name }).eq('id', editingRestaurant.id);
//                     if (error) throw error;
//                 }
//             }

//             toast.success('All Data Saved Successfully!', { id: toastId });
//             fetchAllData();

//         } catch (error) {
//             console.error(error);
//             toast.error('Failed to save changes. Check console.', { id: toastId });
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     const handleTourDataChange = (field, value) => setTourData(prev => ({ ...prev, [field]: value }));

//     if (isLoading) return <div style={{ textAlign: 'center', marginTop: '10vh' }}>Loading Form...</div>;

//     return (
//         <div className="admin-edit-wrapper">
            
//             <ConfirmModal
//                 isOpen={confirmConfig.isOpen}
//                 title={confirmConfig.title}
//                 message={confirmConfig.message}
//                 onConfirm={confirmConfig.onConfirm}
//                 onClose={() => setConfirmConfig(c => ({ ...c, isOpen: false }))}
//             />

//             <div className="admin-edit-header">
//                 <h1>Edit Welcome Meeting</h1>
//                 <p>Manage Day 1 orientation info, guide details, and your hotel/restaurant dictionaries.</p>
//             </div>

//             <form className="edit-form-card" onSubmit={handleSaveAll}>
                
//                 {/* 1. GUIDE PROFILE */}
//                 <div className="form-section">
//                     <h3>Your Guide Profile</h3>
//                     <div className="input-row">
//                         <div><label>Name</label><input type="text" value={guideData.name} onChange={e => setGuideData({...guideData, name: e.target.value})} placeholder="e.g. Ege Alkan" /></div>
//                         <div><label>Years at OAT</label><input type="number" value={guideData.years_at_oat} onChange={e => setGuideData({...guideData, years_at_oat: e.target.value})} /></div>
//                     </div>
//                     {/* REPLACED: URL input → ImageUpload component */}
//                     <ImageUpload
//                         currentUrl={guideData.profile_image_url}
//                         onUpload={(url) => setGuideData(g => ({ ...g, profile_image_url: url }))}
//                         folder="guide"
//                         label="Profile Photo"
//                     />
//                     <div><label>About Me</label><textarea value={guideData.about_me} onChange={e => setGuideData({...guideData, about_me: e.target.value})} /></div>
//                 </div>

//                 {/* 2. GENERAL TRIP & GULLET INFO */}
//                 <div className="form-section">
//                     <h3>Trip & Gullet Info</h3>
//                     <div><label>General Trip Info</label><textarea value={tourData.general_trip_info} onChange={e => handleTourDataChange('general_trip_info', e.target.value)} /></div>
//                     <div className="input-row" style={{ marginTop: '1rem' }}>
//                         <div><label>Turkish Gullet Name</label><input type="text" value={tourData.gullet_name} onChange={e => handleTourDataChange('gullet_name', e.target.value)} /></div>
//                         <div>
//                             <label>Gullet Direction</label>
//                             <select value={tourData.gullet_direction} onChange={e => handleTourDataChange('gullet_direction', e.target.value)}>
//                                 <option value="Fethiye to Marmaris">Fethiye to Marmaris</option>
//                                 <option value="Marmaris to Fethiye">Marmaris to Fethiye</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 3. SPECIAL DINNERS & ACTIVITIES */}
//                 <div className="form-section">
//                     <h3>Special Dinners & Village Activity</h3>
//                     <p className="hint-text">If a restaurant is missing, add it in the Dictionary Builder at the bottom first.</p>
//                     <div className="input-row">
//                         <div>
//                             <label>Welcome Dinner Restaurant</label>
//                             <select value={tourData.welcome_dinner_restaurant_id} onChange={e => handleTourDataChange('welcome_dinner_restaurant_id', e.target.value)}>
//                                 <option value="">-- Select Restaurant --</option>
//                                 {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//                             </select>
//                         </div>
//                         <div>
//                             <label>Farewell Dinner Restaurant</label>
//                             <select value={tourData.farewell_dinner_restaurant_id} onChange={e => handleTourDataChange('farewell_dinner_restaurant_id', e.target.value)}>
//                                 <option value="">-- Select Restaurant --</option>
//                                 {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//                             </select>
//                         </div>
//                     </div>
//                     <div className="input-row" style={{ marginTop: '1rem' }}>
//                         <div><label>Home Hosted Dinner</label><input type="text" value={tourData.home_hosted_village} onChange={e => handleTourDataChange('home_hosted_village', e.target.value)} /></div>
//                         <div><label>Home Hosted Family Names</label><input type="text" value={tourData.home_hosted_family_names} onChange={e => handleTourDataChange('home_hosted_family_names', e.target.value)} /></div>
//                     </div>
//                     <div style={{ marginTop: '1rem' }}><label>Day in the Life Activity</label><input type="text" value={tourData.day_in_life_activity} onChange={e => handleTourDataChange('day_in_life_activity', e.target.value)} /></div>
//                 </div>

//                 {/* 4. DOMESTIC FLIGHT */}
//                 <div className="form-section">
//                     <h3>Domestic Flight Info</h3>
//                     <div className="input-row">
//                         <div><label>Airport Name</label><input type="text" value={tourData.domestic_flight_airport} onChange={e => handleTourDataChange('domestic_flight_airport', e.target.value)} /></div>
//                         <div><label>City</label><input type="text" value={tourData.domestic_flight_city} onChange={e => handleTourDataChange('domestic_flight_city', e.target.value)} /></div>
//                     </div>
//                     <div className="input-row" style={{ marginTop: '1rem' }}>
//                         <div><label>Date</label><input type="date" value={tourData.domestic_flight_date} onChange={e => handleTourDataChange('domestic_flight_date', e.target.value)} /></div>
//                         <div><label>Time</label><input type="time" value={tourData.domestic_flight_time} onChange={e => handleTourDataChange('domestic_flight_time', e.target.value)} /></div>
//                     </div>
//                 </div>

//                 {/* 5. HOTEL DICTIONARY CRUD */}
//                 <div className="form-section">
//                     <h3>Hotel Dictionary Builder</h3>
//                     <label>Select Hotel to Edit/Delete, or Add New:</label>
//                     <div className="dropdown-action-row">
//                         <select value={editingHotel.id} onChange={(e) => {
//                             const val = e.target.value;
//                             if (val === 'new') setEditingHotel({ id: 'new', name: '', description: '', image_url: '' });
//                             else setEditingHotel({ ...hotelsRoster.find(h => h.id.toString() === val) });
//                         }}>
//                             <option value="new">+ Create New Hotel</option>
//                             {hotelsRoster.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
//                         </select>
//                         {editingHotel.id !== 'new' && (
//                             <button type="button" className="btn-delete" onClick={() => handleDeleteItem('hotels', editingHotel, setEditingHotel, setHotelsRoster)}>
//                                 Delete from DB
//                             </button>
//                         )}
//                     </div>
//                     <div><label>Hotel Name</label><input type="text" value={editingHotel.name} onChange={e => setEditingHotel({...editingHotel, name: e.target.value})} /></div>
//                     <div style={{ marginTop: '0.5rem' }}><label>Description</label><textarea value={editingHotel.description} onChange={e => setEditingHotel({...editingHotel, description: e.target.value})} /></div>
//                     {/* REPLACED: URL input → ImageUpload component */}
//                     <ImageUpload
//                         currentUrl={editingHotel.image_url}
//                         onUpload={(url) => setEditingHotel(h => ({ ...h, image_url: url }))}
//                         folder="hotels"
//                         label="Hotel Photo"
//                     />
//                 </div>

//                 {/* 6. RESTAURANT DICTIONARY CRUD */}
//                 <div className="form-section">
//                     <h3>Restaurant Dictionary Builder</h3>
//                     <label>Select Restaurant to Edit/Delete, or Add New:</label>
//                     <div className="dropdown-action-row">
//                         <select value={editingRestaurant.id} onChange={(e) => {
//                             const val = e.target.value;
//                             if (val === 'new') setEditingRestaurant({ id: 'new', name: '' });
//                             else setEditingRestaurant({ ...restaurantsRoster.find(r => r.id.toString() === val) });
//                         }}>
//                             <option value="+ Create New Restaurant">+ Create New Restaurant</option>
//                             {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//                         </select>
//                         {editingRestaurant.id !== 'new' && (
//                             <button type="button" className="btn-delete" onClick={() => handleDeleteItem('restaurants', editingRestaurant, setEditingRestaurant, setRestaurantsRoster)}>
//                                 Delete from DB
//                             </button>
//                         )}
//                     </div>
//                     <div><label>Restaurant Name</label><input type="text" value={editingRestaurant.name} onChange={e => setEditingRestaurant({...editingRestaurant, name: e.target.value})} /></div>
//                 </div>

//                 <button type="submit" className="save-button" disabled={isSaving}>
//                     {isSaving ? 'Saving to Database...' : 'Save Meeting Info & Dictionaries'}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default AdminWelcomeMeetingEdit;






import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/extras/ConfirmModal';
import ImageUpload from '../../components/extras/ImageUpload';
import './AdminWelcomeMeetingEdit.css';

const AdminWelcomeMeetingEdit = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [activeTourId, setActiveTourId] = useState(null);
    const [hotelsRoster, setHotelsRoster] = useState([]);
    const [restaurantsRoster, setRestaurantsRoster] = useState([]);

    const [guideData, setGuideData] = useState({ id: 1, name: '', about_me: '', years_at_oat: '', profile_image_url: '' });
    
    const [tourData, setTourData] = useState({
        welcome_meeting_time: '',
        welcome_meeting_location: '',
        general_trip_info: '', gullet_name: '', gullet_direction: 'Fethiye to Marmaris',
        welcome_dinner_restaurant_id: '', farewell_dinner_restaurant_id: '',
        home_hosted_village: '', home_hosted_family_names: '', day_in_life_activity: '',
        domestic_flight_airport: '', domestic_flight_city: '', domestic_flight_date: '', domestic_flight_time: ''
    });

    const [editingHotel, setEditingHotel] = useState({ id: 'new', name: '', description: '', image_url: '' });
    const [editingRestaurant, setEditingRestaurant] = useState({ id: 'new', name: '' });

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false, title: '', message: '', onConfirm: () => {}
    });

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const { data: activeTour } = await supabase.from('tours').select('*').eq('is_active', true).single();
            if (activeTour) {
                setActiveTourId(activeTour.id);
                setTourData({
                    welcome_meeting_time: activeTour.welcome_meeting_time || '',
                    welcome_meeting_location: activeTour.welcome_meeting_location || '',
                    general_trip_info: activeTour.general_trip_info || '',
                    gullet_name: activeTour.gullet_name || '',
                    gullet_direction: activeTour.gullet_direction || 'Fethiye to Marmaris',
                    welcome_dinner_restaurant_id: activeTour.welcome_dinner_restaurant_id || '',
                    farewell_dinner_restaurant_id: activeTour.farewell_dinner_restaurant_id || '',
                    home_hosted_village: activeTour.home_hosted_village || '',
                    home_hosted_family_names: activeTour.home_hosted_family_names || '',
                    day_in_life_activity: activeTour.day_in_life_activity || '',
                    domestic_flight_airport: activeTour.domestic_flight_airport || '',
                    domestic_flight_city: activeTour.domestic_flight_city || '',
                    domestic_flight_date: activeTour.domestic_flight_date || '',
                    domestic_flight_time: activeTour.domestic_flight_time || ''
                });
            }

            const { data: guide } = await supabase.from('guide_profile').select('*').eq('id', 1).single();
            if (guide) setGuideData(guide);

            const { data: hotels } = await supabase.from('hotels').select('*');
            if (hotels) setHotelsRoster(hotels);

            const { data: restaurants } = await supabase.from('restaurants').select('*');
            if (restaurants) setRestaurantsRoster(restaurants);

        } catch (error) {
            toast.error("Error loading database information.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteItem = (table, itemState, setItemState, rosterSetter) => {
        if (itemState.id === 'new') return;
        setConfirmConfig({
            isOpen: true,
            title: `Delete ${table === 'hotels' ? 'Hotel' : 'Restaurant'}?`,
            message: `Are you sure you want to permanently delete ${itemState.name}?`,
            onConfirm: async () => {
                const toastId = toast.loading('Deleting...');
                try {
                    const { error } = await supabase.from(table).delete().eq('id', itemState.id);
                    if (error) throw error;
                    toast.success('Deleted permanently.', { id: toastId });
                    rosterSetter(prev => prev.filter(i => i.id !== itemState.id));
                    if (table === 'hotels') setItemState({ id: 'new', name: '', description: '', image_url: '' });
                    if (table === 'restaurants') setItemState({ id: 'new', name: '' });
                } catch (error) {
                    toast.error('Failed to delete item.', { id: toastId });
                }
            }
        });
    };

    const handleSaveAll = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving Meeting Info & Dictionaries...');

        try {
            if (activeTourId) {
                const cleanTourData = {
                    ...tourData,
                    welcome_meeting_time: tourData.welcome_meeting_time || null,
                    welcome_meeting_location: tourData.welcome_meeting_location || null,
                    domestic_flight_date: tourData.domestic_flight_date || null,
                    domestic_flight_time: tourData.domestic_flight_time || null,
                    welcome_dinner_restaurant_id: tourData.welcome_dinner_restaurant_id || null,
                    farewell_dinner_restaurant_id: tourData.farewell_dinner_restaurant_id || null,
                    gullet_name: tourData.gullet_name || null,
                    general_trip_info: tourData.general_trip_info || null,
                    domestic_flight_airport: tourData.domestic_flight_airport || null,
                    domestic_flight_city: tourData.domestic_flight_city || null,
                    home_hosted_village: tourData.home_hosted_village || null,
                    home_hosted_family_names: tourData.home_hosted_family_names || null,
                    day_in_life_activity: tourData.day_in_life_activity || null,
                };
                const { error: tourErr } = await supabase.from('tours').update(cleanTourData).eq('id', activeTourId);
                if (tourErr) throw tourErr;
            } else {
                const { data: newTour, error: insertTourErr } = await supabase.from('tours').insert([{ ...tourData, is_active: true }]).select().single();
                if (insertTourErr) throw insertTourErr;
                if (newTour) setActiveTourId(newTour.id);
            }

            const { error: guideErr } = await supabase.from('guide_profile').upsert(guideData, { onConflict: 'id' });
            if (guideErr) throw guideErr;

            if (editingHotel.name.trim() !== '') {
                if (editingHotel.id === 'new') {
                    const { error } = await supabase.from('hotels').insert([{ name: editingHotel.name, description: editingHotel.description, image_url: editingHotel.image_url }]);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('hotels').update({ name: editingHotel.name, description: editingHotel.description, image_url: editingHotel.image_url }).eq('id', editingHotel.id);
                    if (error) throw error;
                }
            }

            if (editingRestaurant.name.trim() !== '') {
                if (editingRestaurant.id === 'new') {
                    const { error } = await supabase.from('restaurants').insert([{ name: editingRestaurant.name }]);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('restaurants').update({ name: editingRestaurant.name }).eq('id', editingRestaurant.id);
                    if (error) throw error;
                }
            }

            toast.success('All Data Saved Successfully!', { id: toastId });
            fetchAllData();

        } catch (error) {
            console.error(error);
            toast.error('Failed to save changes. Check console.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTourDataChange = (field, value) => setTourData(prev => ({ ...prev, [field]: value }));

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '10vh' }}>Loading Form...</div>;

    return (
        <div className="admin-edit-wrapper">
            
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onClose={() => setConfirmConfig(c => ({ ...c, isOpen: false }))}
            />

            <div className="admin-edit-header">
                <h1>Edit Welcome Meeting</h1>
                <p>Manage Day 1 orientation info, guide details, and your hotel/restaurant dictionaries.</p>
            </div>

            <form className="edit-form-card" onSubmit={handleSaveAll}>

                {/* 1. WELCOME MEETING LOGISTICS */}
                <div className="form-section">
                    <h3>Welcome Meeting Details</h3>
                    <p className="hint-text">This appears as the first card guests see on the Welcome Meeting page.</p>
                    <div className="input-row">
                        <div>
                            <label>Meeting Time</label>
                            <input
                                type="time"
                                value={tourData.welcome_meeting_time}
                                onChange={e => handleTourDataChange('welcome_meeting_time', e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Meeting Location</label>
                            <input
                                type="text"
                                placeholder="e.g. Hotel lobby, Conference Room B"
                                value={tourData.welcome_meeting_location}
                                onChange={e => handleTourDataChange('welcome_meeting_location', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. GUIDE PROFILE */}
                <div className="form-section">
                    <h3>Your Guide Profile</h3>
                    <div className="input-row">
                        <div><label>Name</label><input type="text" value={guideData.name} onChange={e => setGuideData({...guideData, name: e.target.value})} placeholder="e.g. Ege Alkan" /></div>
                        <div><label>Years at OAT</label><input type="number" value={guideData.years_at_oat} onChange={e => setGuideData({...guideData, years_at_oat: e.target.value})} /></div>
                    </div>
                    <ImageUpload
                        currentUrl={guideData.profile_image_url}
                        onUpload={(url) => setGuideData(g => ({ ...g, profile_image_url: url }))}
                        folder="guide"
                        label="Profile Photo"
                    />
                    <div><label>About Me</label><textarea value={guideData.about_me} onChange={e => setGuideData({...guideData, about_me: e.target.value})} /></div>
                </div>

                {/* 3. GENERAL TRIP & GULLET INFO */}
                <div className="form-section">
                    <h3>Trip & Gullet Info</h3>
                    <div><label>General Trip Info</label><textarea value={tourData.general_trip_info} onChange={e => handleTourDataChange('general_trip_info', e.target.value)} /></div>
                    <div className="input-row" style={{ marginTop: '1rem' }}>
                        <div><label>Turkish Gullet Name</label><input type="text" value={tourData.gullet_name} onChange={e => handleTourDataChange('gullet_name', e.target.value)} /></div>
                        <div>
                            <label>Gullet Direction</label>
                            <select value={tourData.gullet_direction} onChange={e => handleTourDataChange('gullet_direction', e.target.value)}>
                                <option value="Fethiye to Marmaris">Fethiye to Marmaris</option>
                                <option value="Marmaris to Fethiye">Marmaris to Fethiye</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 4. SPECIAL DINNERS & ACTIVITIES */}
                <div className="form-section">
                    <h3>Special Dinners & Village Activity</h3>
                    <p className="hint-text">If a restaurant is missing, add it in the Dictionary Builder at the bottom first.</p>
                    <div className="input-row">
                        <div>
                            <label>Welcome Dinner Restaurant</label>
                            <select value={tourData.welcome_dinner_restaurant_id} onChange={e => handleTourDataChange('welcome_dinner_restaurant_id', e.target.value)}>
                                <option value="">-- Select Restaurant --</option>
                                {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Farewell Dinner Restaurant</label>
                            <select value={tourData.farewell_dinner_restaurant_id} onChange={e => handleTourDataChange('farewell_dinner_restaurant_id', e.target.value)}>
                                <option value="">-- Select Restaurant --</option>
                                {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="input-row" style={{ marginTop: '1rem' }}>
                        <div><label>Home Hosted Dinner</label><input type="text" value={tourData.home_hosted_village} onChange={e => handleTourDataChange('home_hosted_village', e.target.value)} /></div>
                        <div><label>Home Hosted Family Names</label><input type="text" value={tourData.home_hosted_family_names} onChange={e => handleTourDataChange('home_hosted_family_names', e.target.value)} /></div>
                    </div>
                    <div style={{ marginTop: '1rem' }}><label>Day in the Life Activity</label><input type="text" value={tourData.day_in_life_activity} onChange={e => handleTourDataChange('day_in_life_activity', e.target.value)} /></div>
                </div>

                {/* 5. DOMESTIC FLIGHT */}
                <div className="form-section">
                    <h3>Domestic Flight Info</h3>
                    <div className="input-row">
                        <div><label>Airport Name</label><input type="text" value={tourData.domestic_flight_airport} onChange={e => handleTourDataChange('domestic_flight_airport', e.target.value)} /></div>
                        <div><label>City</label><input type="text" value={tourData.domestic_flight_city} onChange={e => handleTourDataChange('domestic_flight_city', e.target.value)} /></div>
                    </div>
                    <div className="input-row" style={{ marginTop: '1rem' }}>
                        <div><label>Date</label><input type="date" value={tourData.domestic_flight_date} onChange={e => handleTourDataChange('domestic_flight_date', e.target.value)} /></div>
                        <div><label>Time</label><input type="time" value={tourData.domestic_flight_time} onChange={e => handleTourDataChange('domestic_flight_time', e.target.value)} /></div>
                    </div>
                </div>

                {/* 6. HOTEL DICTIONARY CRUD */}
                <div className="form-section">
                    <h3>Hotel Dictionary Builder</h3>
                    <label>Select Hotel to Edit/Delete, or Add New:</label>
                    <div className="dropdown-action-row">
                        <select value={editingHotel.id} onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'new') setEditingHotel({ id: 'new', name: '', description: '', image_url: '' });
                            else setEditingHotel({ ...hotelsRoster.find(h => h.id.toString() === val) });
                        }}>
                            <option value="new">+ Create New Hotel</option>
                            {hotelsRoster.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                        {editingHotel.id !== 'new' && (
                            <button type="button" className="btn-delete" onClick={() => handleDeleteItem('hotels', editingHotel, setEditingHotel, setHotelsRoster)}>
                                Delete from DB
                            </button>
                        )}
                    </div>
                    <div><label>Hotel Name</label><input type="text" value={editingHotel.name} onChange={e => setEditingHotel({...editingHotel, name: e.target.value})} /></div>
                    <div style={{ marginTop: '0.5rem' }}><label>Description</label><textarea value={editingHotel.description} onChange={e => setEditingHotel({...editingHotel, description: e.target.value})} /></div>
                    <ImageUpload
                        currentUrl={editingHotel.image_url}
                        onUpload={(url) => setEditingHotel(h => ({ ...h, image_url: url }))}
                        folder="hotels"
                        label="Hotel Photo"
                    />
                </div>

                {/* 7. RESTAURANT DICTIONARY CRUD */}
                <div className="form-section">
                    <h3>Restaurant Dictionary Builder</h3>
                    <label>Select Restaurant to Edit/Delete, or Add New:</label>
                    <div className="dropdown-action-row">
                        <select value={editingRestaurant.id} onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'new') setEditingRestaurant({ id: 'new', name: '' });
                            else setEditingRestaurant({ ...restaurantsRoster.find(r => r.id.toString() === val) });
                        }}>
                            <option value="new">+ Create New Restaurant</option>
                            {restaurantsRoster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        {editingRestaurant.id !== 'new' && (
                            <button type="button" className="btn-delete" onClick={() => handleDeleteItem('restaurants', editingRestaurant, setEditingRestaurant, setRestaurantsRoster)}>
                                Delete from DB
                            </button>
                        )}
                    </div>
                    <div><label>Restaurant Name</label><input type="text" value={editingRestaurant.name} onChange={e => setEditingRestaurant({...editingRestaurant, name: e.target.value})} /></div>
                </div>

                <button type="submit" className="save-button" disabled={isSaving}>
                    {isSaving ? 'Saving to Database...' : 'Save Meeting Info & Dictionaries'}
                </button>
            </form>
        </div>
    );
};

export default AdminWelcomeMeetingEdit;