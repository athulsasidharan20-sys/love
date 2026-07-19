import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fwvgdhxslalknlauqbui.supabase.co';
const supabaseKey = 'sb_publishable_8MCenertSaCPn9b7J4Rp5g_Gbe5KruQ';

export const supabase = createClient(supabaseUrl, supabaseKey);