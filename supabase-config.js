import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your Supabase URL and Anon Key
const supabaseUrl = 'https://fwvgdhxslalknlauqbui.supabase.co';
const supabaseKey = 'sb_publishable_8MCenertSaCPn9b7J4Rp5g_Gbe5KruQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
