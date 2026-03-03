// import React, { useState, useEffect } from 'react';
// import { supabase } from '../../services/supabaseClient';
// import toast from 'react-hot-toast';
// import './AdminWelcomeEmailEdit.css';

// const AdminWelcomeEmailEdit = () => {
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);
    
//     const [activeTourId, setActiveTourId] = useState(null);
    
//     // Database dictionaries (Past data to populate dropdowns)
//     const [pastClimates, setPastClimates] = useState([]);
//     const [contactsRoster, setContactsRoster] = useState([]);

//     // Form State
//     const [climateInfo, setClimateInfo] = useState('');
//     const [t1, setT1] = useState({ id: 'new', name: '', phone_number: '', role: 'Transfer 1' });
//     const [t2, setT2] = useState({ id: 'new', name: '', phone_number: '', role: 'Transfer 2' });
//     const [ops, setOps] = useState({ id: 'new', name: '', phone_number: '', role: 'OAT Office' });

//     useEffect(() => {
//         fetchAllData();
//     }, []);

//     const fetchAllData = async () => {
//         setIsLoading(true);
//         try {
//             // 1. Fetch Tours (for active tour info and past climate dropdowns)
//             const { data: toursData } = await supabase.from('tours').select('id, climate_info, is_active');
//             if (toursData) {
//                 // Get unique past climates for the dropdown
//                 const uniqueClimates = [...new Set(toursData.map(t => t.climate_info).filter(Boolean))];
//                 setPastClimates(uniqueClimates);

//                 // Set active tour climate
//                 const activeTour = toursData.find(t => t.is_active === true);
//                 if (activeTour) {
//                     setActiveTourId(activeTour.id);
//                     setClimateInfo(activeTour.climate_info || '');
//                 }
//             }

//             // 2. Fetch Contacts Roster
//             const { data: contactsData } = await supabase.from('contacts').select('*');
//             if (contactsData) {
//                 setContactsRoster(contactsData);
//                 // Pre-fill the currently active contacts
//                 const activeT1 = contactsData.find(c => c.role === 'Transfer 1');
//                 const activeT2 = contactsData.find(c => c.role === 'Transfer 2');
//                 const activeOps = contactsData.find(c => c.role === 'OAT Office');
                
//                 if (activeT1) setT1(activeT1);
//                 if (activeT2) setT2(activeT2);
//                 if (activeOps) setOps(activeOps);
//             }
//         } catch (error) {
//             toast.error("Error loading database information.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // --- DELETE FUNCTION ---
//     const handleDeleteContact = async (contactState, setContactState) => {
//         if (contactState.id === 'new') return;
        
//         const confirmed = window.confirm(`Are you sure you want to permanently delete ${contactState.name} from the database?`);
//         if (!confirmed) return;

//         const toastId = toast.loading('Deleting contact...');
//         try {
//             const { error } = await supabase.from('contacts').delete().eq('id', contactState.id);
//             if (error) throw error;

//             toast.success('Contact deleted permanently.', { id: toastId });
//             // Remove from local roster and reset the form block
//             setContactsRoster(prev => prev.filter(c => c.id !== contactState.id));
//             setContactState({ id: 'new', name: '', phone_number: '', role: contactState.role });
//         } catch (error) {
//             toast.error('Failed to delete contact.', { id: toastId });
//         }
//     };

//     // --- SAVE FUNCTION (ADD & EDIT) ---
//     // --- SAVE FUNCTION (ADD & EDIT) ---
//     const handleSaveAll = async (e) => {
//         e.preventDefault();
//         setIsSaving(true);
//         const toastId = toast.loading('Saving Active Tour Data...');

//         try {
//             // 1. Save Climate to Active Tour
//             if (activeTourId) {
//                 const { error: tourErr } = await supabase
//                     .from('tours')
//                     .update({ climate_info: climateInfo })
//                     .eq('id', activeTourId);
//                 if (tourErr) throw tourErr;
//             } else {
//                 const { data: newTour, error: insertTourErr } = await supabase
//                     .from('tours')
//                     .insert([{ climate_info: climateInfo, is_active: true }])
//                     .select()
//                     .single();
//                 if (insertTourErr) throw insertTourErr;
//                 if (newTour) setActiveTourId(newTour.id);
//             }

//             // 2. Separate Valid Contacts into "New" and "Existing"
//             const validContacts = [t1, t2, ops].filter(c => c.name.trim() !== '');
            
//             // Format new contacts by completely stripping out the 'id' property
//             const newContacts = validContacts
//                 .filter(c => c.id === 'new')
//                 .map(c => ({ name: c.name, phone_number: c.phone_number, role: c.role }));

//             // Keep existing contacts exactly as they are (since they have a real database ID)
//             const existingContacts = validContacts
//                 .filter(c => c.id !== 'new');

//             // 3. Insert New Contacts
//             if (newContacts.length > 0) {
//                 const { error: insertErr } = await supabase
//                     .from('contacts')
//                     .insert(newContacts);
//                 if (insertErr) throw insertErr;
//             }

//             // 4. Update Existing Contacts
//             if (existingContacts.length > 0) {
//                 const { error: upsertErr } = await supabase
//                     .from('contacts')
//                     .upsert(existingContacts, { onConflict: 'id' });
//                 if (upsertErr) throw upsertErr;
//             }

//             toast.success('Welcome Email & Roster updated!', { id: toastId });
//             fetchAllData(); // Refresh the page roster so new contacts get their real IDs
//         } catch (error) {
//             console.error("Save Error:", error.message);
//             toast.error('Failed to save changes. Check console.', { id: toastId });
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Helper component to render the Add/Edit/Delete Contact blocks
//     const renderContactEditor = (title, stateObj, setStateFn, roleFilter) => {
//         // Filter the dropdown to only show relevant people (e.g. only Transfer folks)
//         const availableOptions = contactsRoster.filter(c => c.role.includes(roleFilter));

//         const handleDropdownSelect = (e) => {
//             const val = e.target.value;
//             if (val === 'new') {
//                 setStateFn({ id: 'new', name: '', phone_number: '', role: stateObj.role });
//             } else {
//                 const selected = contactsRoster.find(c => c.id.toString() === val);
//                 if (selected) setStateFn({ ...selected, role: stateObj.role });
//             }
//         };

//         return (
//             <div className="form-section">
//                 <h3>{title}</h3>
//                 <label>Select from Database or Add New:</label>
//                 <div className="dropdown-action-row">
//                     <select value={stateObj.id} onChange={handleDropdownSelect}>
//                         <option value="new">+ Create New Contact</option>
//                         {availableOptions.map(c => (
//                             <option key={c.id} value={c.id}>{c.name} ({c.phone_number})</option>
//                         ))}
//                     </select>
//                     {stateObj.id !== 'new' && (
//                         <button type="button" className="btn-delete" onClick={() => handleDeleteContact(stateObj, setStateFn)}>
//                             Delete from DB
//                         </button>
//                     )}
//                 </div>
//                 <div className="input-row">
//                     <div>
//                         <label>Name</label>
//                         <input 
//                             type="text" value={stateObj.name} 
//                             onChange={e => setStateFn({...stateObj, name: e.target.value})}
//                             placeholder="e.g., Ahmet Yılmaz"
//                         />
//                     </div>
//                     <div>
//                         <label>Phone Number</label>
//                         <input 
//                             type="tel" value={stateObj.phone_number} 
//                             onChange={e => setStateFn({...stateObj, phone_number: e.target.value})}
//                             placeholder="+90 555 123 4567"
//                         />
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     if (isLoading) return <div style={{ textAlign: 'center', marginTop: '10vh' }}>Loading Form...</div>;

//     return (
//         <div className="admin-edit-wrapper">
//             <div className="admin-edit-header">
//                 <h1>Edit Welcome Email</h1>
//                 <p>Manage the pre-arrival information and your reusable contact dictionary.</p>
//             </div>

//             <form className="edit-form-card" onSubmit={handleSaveAll}>
                
//                 {/* Climate Info Section */}
//                 <div className="form-section">
//                     <h3>Climate & Weather Changes</h3>
//                     <label>Select Previous Climate Info:</label>
//                     <div className="dropdown-action-row">
//                         <select onChange={(e) => { if (e.target.value !== 'new') setClimateInfo(e.target.value); }}>
//                             <option value="new">-- Type new below --</option>
//                             {pastClimates.map((text, idx) => (
//                                 <option key={idx} value={text}>{text.substring(0, 60)}...</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <label>Detailed Climate Information</label>
//                         <textarea 
//                             value={climateInfo}
//                             onChange={(e) => setClimateInfo(e.target.value)}
//                             placeholder="Enter expected weather changes, recommended clothing, etc."
//                             required
//                         />
//                     </div>
//                 </div>

//                 {/* Dynamic Contact Editors */}
//                 {renderContactEditor('Transfer Personnel 1', t1, setT1, 'Transfer')}
//                 {renderContactEditor('Transfer Personnel 2', t2, setT2, 'Transfer')}
//                 {renderContactEditor('OAT Operations Team', ops, setOps, 'OAT Office')}

//                 <button type="submit" className="save-button" disabled={isSaving}>
//                     {isSaving ? 'Saving to Database...' : 'Save Active Tour & Dictionary'}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default AdminWelcomeEmailEdit;










import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/extras/ConfirmModal'; // Added import
import './AdminWelcomeEmailEdit.css';

const AdminWelcomeEmailEdit = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [activeTourId, setActiveTourId] = useState(null);
    
    // Database dictionaries
    const [pastClimates, setPastClimates] = useState([]);
    const [contactsRoster, setContactsRoster] = useState([]);

    // Form State
    const [climateInfo, setClimateInfo] = useState('');
    const [t1, setT1] = useState({ id: 'new', name: '', phone_number: '', role: 'Transfer 1' });
    const [t2, setT2] = useState({ id: 'new', name: '', phone_number: '', role: 'Transfer 2' });
    const [ops, setOps] = useState({ id: 'new', name: '', phone_number: '', role: 'OAT Office' });

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
            const { data: toursData } = await supabase.from('tours').select('id, climate_info, is_active');
            if (toursData) {
                const uniqueClimates = [...new Set(toursData.map(t => t.climate_info).filter(Boolean))];
                setPastClimates(uniqueClimates);

                const activeTour = toursData.find(t => t.is_active === true);
                if (activeTour) {
                    setActiveTourId(activeTour.id);
                    setClimateInfo(activeTour.climate_info || '');
                }
            }

            const { data: contactsData } = await supabase.from('contacts').select('*');
            if (contactsData) {
                setContactsRoster(contactsData);
                const activeT1 = contactsData.find(c => c.role === 'Transfer 1');
                const activeT2 = contactsData.find(c => c.role === 'Transfer 2');
                const activeOps = contactsData.find(c => c.role === 'OAT Office');
                
                if (activeT1) setT1(activeT1);
                if (activeT2) setT2(activeT2);
                if (activeOps) setOps(activeOps);
            }
        } catch (error) {
            toast.error("Error loading database information.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- REPLACED WINDOW.CONFIRM WITH CUSTOM MODAL ---
    const handleDeleteContact = (contactState, setContactState) => {
        if (contactState.id === 'new') return;
        
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Contact?',
            message: `Are you sure you want to permanently delete ${contactState.name} from the database?`,
            onConfirm: async () => {
                const toastId = toast.loading('Deleting contact...');
                try {
                    const { error } = await supabase.from('contacts').delete().eq('id', contactState.id);
                    if (error) throw error;

                    toast.success('Contact deleted permanently.', { id: toastId });
                    setContactsRoster(prev => prev.filter(c => c.id !== contactState.id));
                    setContactState({ id: 'new', name: '', phone_number: '', role: contactState.role });
                } catch (error) {
                    toast.error('Failed to delete contact.', { id: toastId });
                }
            }
        });
    };

    const handleSaveAll = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving Active Tour Data...');

        try {
            if (activeTourId) {
                const { error: tourErr } = await supabase.from('tours').update({ climate_info: climateInfo }).eq('id', activeTourId);
                if (tourErr) throw tourErr;
            } else {
                const { data: newTour, error: insertTourErr } = await supabase.from('tours').insert([{ climate_info: climateInfo, is_active: true }]).select().single();
                if (insertTourErr) throw insertTourErr;
                if (newTour) setActiveTourId(newTour.id);
            }

            const validContacts = [t1, t2, ops].filter(c => c.name.trim() !== '');
            const newContacts = validContacts.filter(c => c.id === 'new').map(c => ({ name: c.name, phone_number: c.phone_number, role: c.role }));
            const existingContacts = validContacts.filter(c => c.id !== 'new');

            if (newContacts.length > 0) {
                const { error: insertErr } = await supabase.from('contacts').insert(newContacts);
                if (insertErr) throw insertErr;
            }

            if (existingContacts.length > 0) {
                const { error: upsertErr } = await supabase.from('contacts').upsert(existingContacts, { onConflict: 'id' });
                if (upsertErr) throw upsertErr;
            }

            toast.success('Welcome Email & Roster updated!', { id: toastId });
            fetchAllData(); 
        } catch (error) {
            console.error("Save Error:", error.message);
            toast.error('Failed to save changes. Check console.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const renderContactEditor = (title, stateObj, setStateFn, roleFilter) => {
        const availableOptions = contactsRoster.filter(c => c.role.includes(roleFilter));

        const handleDropdownSelect = (e) => {
            const val = e.target.value;
            if (val === 'new') {
                setStateFn({ id: 'new', name: '', phone_number: '', role: stateObj.role });
            } else {
                const selected = contactsRoster.find(c => c.id.toString() === val);
                if (selected) setStateFn({ ...selected, role: stateObj.role });
            }
        };

        return (
            <div className="form-section">
                <h3>{title}</h3>
                <label>Select from Database or Add New:</label>
                <div className="dropdown-action-row">
                    <select value={stateObj.id} onChange={handleDropdownSelect}>
                        <option value="new">+ Create New Contact</option>
                        {availableOptions.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.phone_number})</option>
                        ))}
                    </select>
                    {stateObj.id !== 'new' && (
                        <button type="button" className="btn-delete" onClick={() => handleDeleteContact(stateObj, setStateFn)}>
                            Delete from DB
                        </button>
                    )}
                </div>
                <div className="input-row">
                    <div>
                        <label>Name</label>
                        <input type="text" value={stateObj.name} onChange={e => setStateFn({...stateObj, name: e.target.value})} placeholder="e.g., Ahmet Yılmaz" />
                    </div>
                    <div>
                        <label>Phone Number</label>
                        <input type="tel" value={stateObj.phone_number} onChange={e => setStateFn({...stateObj, phone_number: e.target.value})} placeholder="+90 555 123 4567" />
                    </div>
                </div>
            </div>
        );
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
                <h1>Edit Welcome Email</h1>
                <p>Manage the pre-arrival information and your reusable contact dictionary.</p>
            </div>

            <form className="edit-form-card" onSubmit={handleSaveAll}>
                <div className="form-section">
                    <h3>Climate & Weather Changes</h3>
                    <label>Select Previous Climate Info:</label>
                    <div className="dropdown-action-row">
                        <select onChange={(e) => { if (e.target.value !== 'new') setClimateInfo(e.target.value); }}>
                            <option value="new">-- Type new below --</option>
                            {pastClimates.map((text, idx) => (
                                <option key={idx} value={text}>{text.substring(0, 60)}...</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Detailed Climate Information</label>
                        <textarea value={climateInfo} onChange={(e) => setClimateInfo(e.target.value)} placeholder="Enter expected weather changes, recommended clothing, etc." required />
                    </div>
                </div>

                {renderContactEditor('Transfer Personnel 1', t1, setT1, 'Transfer')}
                {renderContactEditor('Transfer Personnel 2', t2, setT2, 'Transfer')}
                {renderContactEditor('OAT Operations Team', ops, setOps, 'OAT Office')}

                <button type="submit" className="save-button" disabled={isSaving}>
                    {isSaving ? 'Saving to Database...' : 'Save Active Tour & Dictionary'}
                </button>
            </form>
        </div>
    );
};

export default AdminWelcomeEmailEdit;