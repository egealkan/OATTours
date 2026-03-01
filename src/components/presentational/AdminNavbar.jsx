import './AdminNavbar.css';

const AdminNavbar = ({ onLogout }) => {
  return (
    <nav className="admin-navbar">
      <h3 className="admin-navbar-brand">OAT Tour Control Panel</h3>
      <button className="admin-logout-btn" onClick={onLogout}>
        Logout
      </button>
    </nav>
  );
};

export default AdminNavbar;