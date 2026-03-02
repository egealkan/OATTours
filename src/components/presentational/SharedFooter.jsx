import React from 'react';
import './SharedFooter.css';

const SharedFooter = ({ role }) => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="shared-footer">
            <div className="footer-container">
                <p>&copy; {currentYear} OAT Tours Turkey. All rights reserved.</p>
                {role === 'admin' && <p className="admin-badge">Admin Mode Active</p>}
            </div>
        </footer>
    );
};

export default SharedFooter;