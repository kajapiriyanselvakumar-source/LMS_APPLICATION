import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await api.post('/auth/refresh');
                setAccessToken(data.accessToken);
                const userRes = await api.get('/auth/me'); // Optional: fetch full user data if needed
                setUser(userRes.data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        // checkAuth(); // Silent refresh will handle it on first request if cookie exists
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setAccessToken(data.accessToken);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        return data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setAccessToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
