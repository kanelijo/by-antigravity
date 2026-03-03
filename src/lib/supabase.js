import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tuyyctcvaktbfhqbderu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eXljdGN2YWt0YmZocWJkZXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjMwMjUsImV4cCI6MjA4NzkzOTAyNX0.XXX86xgbL67c6T8QEAPVRHXUaByZj7oeHg90KNfLW4g'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
