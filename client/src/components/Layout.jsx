import { Outlet } from 'react-router-dom';
import DotGrid from './DotGrid'; 
import Navbar from './Navbar'; // <--- IMPORT

const Layout = () => {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Background Effect */}
      <DotGrid />

      {/* Shared Navigation (Includes Sidebar logic) */}
      <Navbar />

      {/* Main Page Content */}
      <main style={{ 
        flex: 1, 
        paddingTop: '140px', // Space for fixed navbar
        paddingLeft: '1.5rem', 
        paddingRight: '1.5rem',
        paddingBottom: '2rem', 
        width: '100%', 
        maxWidth: '1400px', 
        margin: '0 auto',
        position: 'relative', 
        zIndex: 1
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;