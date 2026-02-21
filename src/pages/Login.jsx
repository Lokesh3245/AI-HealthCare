import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { initLogin, verifyOTP, loading } = useAuth();
    const navigate = useNavigate();

    const [role, setRole] = useState('doctor'); // 'doctor' or 'admin'
    const [step, setStep] = useState(1); // 1: Email/Pass, 2: OTP
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState(null);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const result = await initLogin(email, password, role);
        if (result.success) {
            setGeneratedOtp(result.otp);
            setStep(2);
        } else {
            setError(result.message);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        const result = await verifyOTP(email, otp, generatedOtp);

        if (result && result.success) {
            const isAdminEmail = email.includes('admin');
            if (role === 'doctor' && isAdminEmail) {
                setError('Please use the Admin Login tab for admin accounts.');
                return;
            }
            if (role === 'admin' && !isAdminEmail) {
                setError('Access Denied. Not an admin account.');
                return;
            }
            navigate(role === 'admin' ? '/admin' : '/');
        } else {
            if (otp === generatedOtp) {
                navigate(role === 'admin' ? '/admin' : '/');
            } else {
                setError('Invalid OTP. Please try again.');
            }
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f1f5f9',
            fontFamily: "'Segoe UI', sans-serif"
        }}>
            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>BreathCare AI</h1>
                    <p style={{ color: '#64748b' }}>Secure Medical Access</p>
                </div>

                {/* Role Toggle */}
                {step === 1 && (
                    <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => { setRole('doctor'); setError(''); }}
                            style={{
                                flex: 1,
                                padding: '8px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                background: role === 'doctor' ? 'white' : 'transparent',
                                color: role === 'doctor' ? '#0284c7' : '#64748b',
                                boxShadow: role === 'doctor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Doctor Login
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRole('admin'); setError(''); }}
                            style={{
                                flex: 1,
                                padding: '8px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                background: role === 'admin' ? 'white' : 'transparent',
                                color: role === 'admin' ? '#0284c7' : '#64748b',
                                boxShadow: role === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Admin Login
                        </button>
                    </div>
                )}

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>
                                {role === 'admin' ? 'Admin Email' : 'Doctor Email'}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={role === 'admin' ? "admin@hospital.com" : "doctor@hospital.com"}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: role === 'admin' ? '#475569' : '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Verifying...' : `Login as ${role === 'admin' ? 'Admin' : 'Doctor'}`}
                        </button>
                        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                            Demo Creds: {role === 'admin' ? 'admin@hospital.com / admin123' : 'doctor@hospital.com / password123'}
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerify}>
                        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                            <p style={{ marginBottom: '1rem' }}>An OTP has been sent to <strong>{email}</strong></p>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 4-digit OTP"
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Checking...' : 'Verify & Login'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Back to Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
