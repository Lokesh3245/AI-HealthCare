import React, { createContext, useState, useContext, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const AuthContext = createContext(null);

// Initial Hardcoded Users
const initialUsers = [
    { email: 'doctor@hospital.com', password: 'password123', role: 'doctor', name: 'Dr. Smith' },
    { email: 'sarah@hospital.com', password: 'password123', role: 'doctor', name: 'Dr. Sarah Johnson' },
    { email: 'michael@hospital.com', password: 'password123', role: 'doctor', name: 'Dr. Michael Chen' },
    { email: 'emily@hospital.com', password: 'password123', role: 'doctor', name: 'Dr. Emily Davis' },
    { email: 'james@hospital.com', password: 'password123', role: 'doctor', name: 'Dr. James Wilson' },
    { email: 'robert@hospital.com', password: 'password123', role: 'doctor', name: 'Dr. Robert Brown' },
    { email: 'linda@hospital.com', password: 'password123', role: 'doctor', name: 'Dr. Linda Taylor' },
    { email: 'admin@hospital.com', password: 'admin123', role: 'admin', name: 'Ashok' },
];

export const AuthProvider = ({ children }) => {
    // Initialize users from LocalStorage or default list
    const [users, setUsers] = useState(() => {
        const storedUsers = localStorage.getItem('appUsers');
        return storedUsers ? JSON.parse(storedUsers) : initialUsers;
    });

    const [user, setUser] = useState(null); // Current logged in user
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Sync users to LocalStorage whenever they change
    useEffect(() => {
        localStorage.setItem('appUsers', JSON.stringify(users));
    }, [users]);

    // --- USER MANAGEMENT FUNCTIONS ---
    const registerUser = (newUser) => {
        if (users.some(u => u.email === newUser.email)) {
            return { success: false, message: 'User with this email already exists.' };
        }
        setUsers([...users, { ...newUser, role: 'doctor' }]); // Force role to doctor for now
        return { success: true };
    };

    const removeUser = (email) => {
        if (email === 'admin@hospital.com') { // Prevent deleting main admin
            return { success: false, message: 'Cannot delete the main admin account.' };
        }
        setUsers(users.filter(u => u.email !== email));
        return { success: true };
    };

    // Verify Email/Password -> Send OTP
    const initLogin = async (email, password, role = 'doctor') => {
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 800));

        // CHECK AGAINST STATEFUL USERS LIST
        let validUser = users.find(u => u.email === email && u.password === password);

        // DEMO MODE: If user not found, create a temporary session user for testing real emails
        if (!validUser) {
            console.log(`[AUTH] User not found in list. Creating temporary ${role} session for ${email}.`);
            validUser = {
                email: email,
                password: password,
                role: role,
                name: role === 'admin' ? 'Demo Admin' : 'Demo Doctor'
            };
            // Add to users list temporarily (will persist due to state sync)
            setUsers(prev => [...prev, validUser]);
        }

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`%c [AUTH] Generated OTP for ${email}: ${otp}`, 'color: #10b981; font-weight: bold; font-size: 14px;');

        // --- EMAILJS CONFIGURATION ---
        const SERVICE_ID = 'YOUR_SERVICE_ID';
        const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
        const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

        const templateParams = {
            to_email: email,
            to_name: validUser.name,
            otp: otp,
        };

        try {
            if (SERVICE_ID !== 'YOUR_SERVICE_ID') {
                await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
                alert(`OTP sent to ${email}`);
            } else {
                console.warn('[Auth] EmailJS keys missing. OTP logged to console.');
                alert(`[DEMO MODE] Keys missing. OTP for ${email}: ${otp}`);
            }
        } catch (error) {
            console.error('[Auth] Failed to send OTP:', error);
            alert('Failed to send OTP email. Check console for details.');
        }

        setLoading(false);
        return { success: true, otp };
    };

    // Verify OTP -> Complete Login
    const verifyOTP = async (email, inputOtp, generatedOtp) => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        setLoading(false);

        if (inputOtp === generatedOtp) {
            const validUser = users.find(u => u.email === email);
            if (validUser) {
                const userData = { ...validUser };
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userData));

                // LOG TO ADMIN DATABASE (localStorage)
                const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
                loginHistory.push({
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    timestamp: new Date().toLocaleString()
                });
                localStorage.setItem('loginHistory', JSON.stringify(loginHistory));

                return { success: true };
            }
        }
        return { success: false, message: 'Invalid OTP' };
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            users, // EXPOSE USERS LIST
            registerUser, // EXPOSE ADD FUNCTION
            removeUser, // EXPOSE REMOVE FUNCTION
            initLogin,
            verifyOTP,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
