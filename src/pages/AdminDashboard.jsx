import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateReportHTML } from '../utils/reportGenerator';

const AdminDashboard = () => {
    const { users, registerUser, removeUser } = useAuth();
    const [loginHistory, setLoginHistory] = useState([]);
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'reports'

    // New Doctor Form State
    const [newDocName, setNewDocName] = useState('');
    const [newDocEmail, setNewDocEmail] = useState('');
    const [newDocPassword, setNewDocPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        setLoginHistory(history);
    }, []);

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear the login history?')) {
            localStorage.removeItem('loginHistory');
            setLoginHistory([]);
        }
    };

    const handleAddDoctor = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newDocName || !newDocEmail || !newDocPassword) {
            setError('All fields are required.');
            return;
        }

        const result = registerUser({
            name: newDocName,
            email: newDocEmail,
            password: newDocPassword
        });

        if (result.success) {
            setSuccess(`Success! ${newDocName} added.`);
            setNewDocName('');
            setNewDocEmail('');
            setNewDocPassword('');
        } else {
            setError(result.message);
        }
    };

    const handleRemoveUser = (email, name) => {
        if (window.confirm(`Are you sure you want to remove ${name}? They will no longer be able to log in.`)) {
            const result = removeUser(email);
            if (!result.success) {
                alert(result.message);
            }
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#0f172a' }}>Admin Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {view === 'reports' ? (
                        <button
                            onClick={() => setView('dashboard')}
                            style={{ background: '#64748b', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            ← Back to Dashboard
                        </button>
                    ) : (
                        <button
                            onClick={() => setView('reports')}
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            📄 View Patient Reports
                        </button>
                    )}
                </div>
            </div>

            {view === 'reports' ? (
                /* REPORTS VIEW */
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#334155' }}>Patient Reports Archive</h2>
                        <button
                            onClick={() => {
                                if (window.confirm('Clear all patient reports?')) {
                                    localStorage.removeItem('patientReports');
                                    window.location.reload();
                                }
                            }}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            Trash All Reports
                        </button>
                    </div>
                    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Doctor & ID</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Date</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Diagnosis & Details</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const reports = JSON.parse(localStorage.getItem('patientReports') || '[]');
                                    if (reports.length === 0) return (
                                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No reports found.</td></tr>
                                    );
                                    return reports.slice().reverse().map((rpt, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '600', color: '#0f172a' }}>{rpt.doctorName}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{rpt.id}</div>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#475569' }}>{rpt.date}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    fontWeight: 'bold',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: rpt.details?.riskLevel === 'High' ? '#fee2e2' : rpt.details?.riskLevel === 'Moderate' ? '#fef3c7' : '#dcfce7',
                                                    color: rpt.details?.riskLevel === 'High' ? '#991b1b' : rpt.details?.riskLevel === 'Moderate' ? '#92400e' : '#166534'
                                                }}>
                                                    {rpt.diagnosis}
                                                </span>
                                                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                    Eye: {rpt.details?.eye} | Cough: {rpt.details?.cough}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {rpt.fullData && (
                                                    <button
                                                        onClick={() => {
                                                            const win = window.open('', '_blank');
                                                            win.document.write(generateReportHTML(rpt.fullData));
                                                            win.document.close();
                                                        }}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        View Report
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* DASHBOARD VIEW */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* LEFT COLUMN: Manage Doctors */}
                    <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#334155' }}>Manage Doctors</h2>

                        {/* Add Doctor Form */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#0f172a' }}>Add New Doctor</h3>
                            {error && <p style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{error}</p>}
                            {success && <p style={{ color: '#16a34a', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{success}</p>}

                            <form onSubmit={handleAddDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <input
                                    type="text"
                                    placeholder="Doctor Name"
                                    value={newDocName}
                                    onChange={e => setNewDocName(e.target.value)}
                                    style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={newDocEmail}
                                    onChange={e => setNewDocEmail(e.target.value)}
                                    style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                />
                                <input
                                    type="password"
                                    placeholder="Set Password"
                                    value={newDocPassword}
                                    onChange={e => setNewDocPassword(e.target.value)}
                                    style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                />
                                <button type="submit" style={{ padding: '0.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    + Add Doctor
                                </button>
                            </form>
                        </div>

                        {/* List of Authors */}
                        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                            <h3 style={{ fontSize: '1rem', padding: '1rem', borderBottom: '1px solid #f1f5f9', margin: 0, background: '#f8fafc' }}>Authorized Users</h3>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {users.map(u => (
                                    <div key={u.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <div>
                                            <div style={{ fontWeight: '500', color: '#0f172a' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.email}</div>
                                        </div>
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => handleRemoveUser(u.email, u.name)}
                                                style={{ padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                        {u.role === 'admin' && <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>Admin</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Login History & Reports */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Login History Table */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', color: '#334155' }}>Login History</h2>
                                <button
                                    onClick={clearHistory}
                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    Clear Log
                                </button>
                            </div>

                            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead style={{ background: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>User</th>
                                            <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Role</th>
                                            <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loginHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No logs yet.</td>
                                            </tr>
                                        ) : (
                                            loginHistory.slice().reverse().map((entry, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <div style={{ fontWeight: '500' }}>{entry.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{entry.email}</div>
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <span style={{
                                                            padding: '0.15rem 0.5rem',
                                                            borderRadius: '999px',
                                                            fontSize: '0.75rem',
                                                            background: entry.role === 'admin' ? '#e0f2fe' : '#dcfce7',
                                                            color: entry.role === 'admin' ? '#0369a1' : '#166534'
                                                        }}>
                                                            {entry.role === 'admin' ? 'Admin' : 'Dr.'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>{entry.timestamp}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
