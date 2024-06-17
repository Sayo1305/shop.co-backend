const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.YOUR_SUPABASE_URL;
const supabaseKey = process.env.YOUR_SUPABASE_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports= supabase;
