import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication state and methods.
 * This simplifies data access across the app.
 */
export const useAuth = () => {
    const context = useAuthContext();
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
