import { Outlet } from 'react-router-dom';

const GuestLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Global Header */}
      <header style={{ backgroundColor: 'var(--aegean-blue)', color: 'var(--pamukkale-white)', padding: '1rem 2rem' }}>
        <h2 style={{ margin: 0 }}>OAT Turkey Tours</h2>
      </header>

      {/* Dynamic Page Content Injector */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet /> 
      </main>

      {/* Global Footer */}
      <footer style={{ backgroundColor: 'var(--charcoal)', color: 'var(--pamukkale-white)', padding: '1rem 2rem', textAlign: 'center' }}>
        <p style={{ margin: 0 }}>© 2026 Your Name - Tour Guide</p>
      </footer>

    </div>
  );
};

export default GuestLayout;