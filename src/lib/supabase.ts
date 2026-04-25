import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'dummy-url',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'
)