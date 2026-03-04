export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'kanelijo-auth-v3',
    lock: {
      acquire: (name, acquireLock) => acquireLock(),
      release: (name) => Promise.resolve(),
    }
  }
})
