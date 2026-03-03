import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import './GuestWelcomePage.css';

const GuestWelcomePage = () => {
  const [climateInfo, setClimateInfo] = useState('');
  const [contacts, setContacts] = useState({ transfers: [], office: [] });
  const [guideProfile, setGuideProfile] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isClimateModalOpen, setIsClimateModalOpen] = useState(false);

  useEffect(() => {
    const fetchWelcomeInfo = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch active tour's climate info
        const { data: tourData, error: tourError } = await supabase
          .from('tours')
          .select('climate_info')
          .eq('is_active', true)
          .single();
        
        if (tourError && tourError.code !== 'PGRST116') console.error('Error fetching tour:', tourError);
        else if (tourData) setClimateInfo(tourData.climate_info);

        // 2. Fetch the contacts dictionary
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('*');
        
        if (contactsError) console.error('Error fetching contacts:', contactsError);
        else if (contactsData) {
          setContacts({
            transfers: contactsData.filter(c => c.role.includes('Transfer')),
            office: contactsData.filter(c => c.role.includes('OAT Office'))
          });
        }

        // 3. Fetch Guide Profile (About Me)
        const { data: guideData, error: guideError } = await supabase
          .from('guide_profile')
          .select('*')
          .limit(1)
          .single();
        
        if (guideError && guideError.code !== 'PGRST116') console.error('Error fetching guide profile:', guideError);
        else if (guideData) setGuideProfile(guideData);

      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWelcomeInfo();
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isClimateModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isClimateModalOpen]);

  if (isLoading) {
    return <div className="loading-spinner">Loading Pre-Trip Information...</div>;
  }

  return (
    <div className="guest-page-wrapper">
      <div className="guest-header">
        <h1>Pre-Trip Information</h1>
        <p>Everything you need to know before you arrive in Turkey.</p>
      </div>

      {/* Guide "About Me" Card */}
      {guideProfile && (
        <div className="info-card guide-card">
          <h2>👋 Meet Your Guide</h2>
          <div className="guide-content-flex">
            {guideProfile.profile_image_url ? (
              <img src={guideProfile.profile_image_url} alt={guideProfile.name} className="guide-avatar" />
            ) : (
              <div className="guide-avatar-placeholder">
                {guideProfile.name ? guideProfile.name.charAt(0).toUpperCase() : 'G'}
              </div>
            )}
            <div className="guide-details">
              <h3>{guideProfile.name}</h3>
              {guideProfile.years_at_oat && (
                <span className="guide-badge">{guideProfile.years_at_oat} Years at OAT</span>
              )}
              <p className="about-me-text">
                {guideProfile.about_me || "I can't wait to meet you all and explore Turkey together!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Climate & Weather Card */}
      <div className="info-card center-card">
        <h2>🌤️ Climate & Useful Tips</h2>
        <p className="climate-summary">
          Turkey's weather can vary greatly depending on the region. Click below to read the detailed forecast and clothing recommendations for our specific route.
        </p>
        <button 
          className="btn-open-modal"
          onClick={() => setIsClimateModalOpen(true)}
        >
          Read Climate Information
        </button>
      </div>

      {/* Important Contacts Card */}
      <div className="info-card">
        <h2>📞 Important Contacts</h2>
        
        <div className="contacts-section">
          <h3>Airport Transfer Personnel</h3>
          {contacts.transfers.length > 0 ? (
            <div className="contacts-grid">
              {contacts.transfers.map(contact => (
                <div key={contact.id} className="contact-item">
                  <span className="contact-name">{contact.name}</span>
                  <a href={`tel:${contact.phone_number}`} className="contact-phone">
                    {contact.phone_number}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">Transfer personnel not assigned yet.</p>
          )}
        </div>

        <div className="contacts-section">
          <h3>OAT Office Operations</h3>
          {contacts.office.length > 0 ? (
            <div className="contacts-grid">
              {contacts.office.map(contact => (
                <div key={contact.id} className="contact-item">
                  <span className="contact-name">{contact.name}</span>
                  <a href={`tel:${contact.phone_number}`} className="contact-phone">
                    {contact.phone_number}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">Office contact not assigned yet.</p>
          )}
        </div>
      </div>

      {/* CLIMATE MODAL */}
      {isClimateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsClimateModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🌤️ Climate & Weather</h2>
              <button className="btn-close-modal" onClick={() => setIsClimateModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {climateInfo ? (
                <p className="climate-text">{climateInfo}</p>
              ) : (
                <p className="empty-text">Climate information has not been updated for this tour yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestWelcomePage;