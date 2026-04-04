import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fcgtnduxbvoiuytyuaxu.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_SAFhGAIwRx_uR_iWdR4FVw_l5DfowuG'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
