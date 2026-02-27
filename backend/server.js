require('dotenv').config();
const app = require('./src/app');
const supabase = require('./src/config/supabase');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    // Connectivity Check
    try {
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) throw error;
        console.log('✅ Connected to Database (Supabase) successfully!');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
});
