import { Link } from 'react-router-dom';

const GuestWelcomePage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Guest View!</h1>
      <p>This is where your travelers will see their tour info.</p>
      
      {/* Temporary button to help you test the routing securely */}
      <div style={{ marginTop: '30px' }}>
        <Link 
          to="/admin/login" 
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--charcoal)',
            color: 'var(--anatolian-sun)',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          Go to Admin Login 🔒
        </Link>
      </div>
    </div>
  );
};

export default GuestWelcomePage;