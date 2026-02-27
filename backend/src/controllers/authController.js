const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { hashToken } = require('../utils/tokenUtils');

// POST /api/auth/register
const register = async (req, res) => {
    try {
        console.log("hello");
        const { email, password, full_name, role, grade, language_pref } = req.body;
        

        if (!email || !password || !full_name || !role) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const validRoles = ['student', 'teacher', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check existing user
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows found", which is fine
            console.error('Check user error:', checkError.message);
            throw new Error('Database connection failed during verification');
        }

        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const password_hash = await bcrypt.hash(password, 12);

        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                email,
                password_hash,
                full_name,
                role,
                grade: role === 'student' ? grade : null,
                language_pref: language_pref || 'en',
            })
            .select('id, email, full_name, role, grade, language_pref')
            .single();

        if (error) throw error;

        return res.status(201).json({ message: 'Registration successful', user: newUser });
    } catch (err) {
        console.error('Register error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = { id: user.id, email: user.email, role: user.role };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        const refreshTokenHash = hashToken(refreshToken);

        await supabase
            .from('users')
            .update({ refresh_token_hash: refreshTokenHash })
            .eq('id', user.id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        const { password_hash, refresh_token_hash, ...safeUser } = user;

        return res.json({ accessToken, user: safeUser });
    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/auth/logout
const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        await supabase.from('users').update({ refresh_token_hash: null }).eq('id', userId);
        res.clearCookie('refreshToken');
        return res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: 'No refresh token' });

        let decoded;
        try {
            decoded = verifyRefreshToken(token);
        } catch {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const tokenHash = hashToken(token);
        const { data: user } = await supabase
            .from('users')
            .select('id, email, role, refresh_token_hash')
            .eq('id', decoded.id)
            .single();

        if (!user || user.refresh_token_hash !== tokenHash) {
            return res.status(401).json({ message: 'Refresh token revoked' });
        }

        const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
        return res.json({ accessToken });
    } catch (err) {
        console.error('Refresh error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, logout, refresh };
