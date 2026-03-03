import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete" }) => {
    if (!isOpen) return null;

    return (
        <div className="custom-confirm-overlay" onClick={onClose}>
            <div className="custom-confirm-box" onClick={(e) => e.stopPropagation()}>
                
                <div className="custom-confirm-icon">
                    {/* A simple warning triangle icon in your Anatolian Sun color */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-anatolian-sun)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>

                <h3 className="custom-confirm-title">{title}</h3>
                <p className="custom-confirm-message">{message}</p>
                
                <div className="custom-confirm-actions">
                    <button className="btn-confirm-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-confirm-danger" onClick={() => { onConfirm(); onClose(); }}>
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ConfirmModal;