import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Hide Navbar on Login page
    if (location.pathname === '/login') {
        return null;
    }

    const linkStyle = {
        color: 'white',
        textDecoration: 'none',
        fontWeight: '500',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        transition: 'background 0.2s',
    };

    const activeLinkStyle = {
        ...linkStyle,
        background: 'rgba(255, 255, 255, 0.15)',
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ background: '#0284c7', padding: '1rem 0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🫁 BreathCare AI
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {(!user || user.role !== 'admin') && (
                        <Link to="/" state={{ reset: true }} style={location.pathname === '/' ? activeLinkStyle : linkStyle}>
                            Home
                        </Link>
                    )}
                    {user && user.role === 'admin' && (
                        <Link to="/admin" style={location.pathname === '/admin' ? activeLinkStyle : linkStyle}>
                            Admin Dashboard
                        </Link>
                    )}
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ color: '#e0f2fe', fontSize: '0.9rem' }}>
                                {user.name} ({user.role === 'admin' ? 'Admin' : 'Dr.'})
                            </span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
