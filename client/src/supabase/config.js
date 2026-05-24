import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hnzndxyazysebijvpgrq.supabase.co'

const supabaseAnonKey = 'sb_publishable_WMkx1Uzfn7KbLu9ydBFA1Q_vi-cDU-G'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)