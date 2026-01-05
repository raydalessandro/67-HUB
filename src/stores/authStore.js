import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  artist: null,
  loading: true,
  
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        await get().fetchProfile(session.user.id)
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await get().fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null, artist: null })
        }
      })
    } catch (error) {
      console.error('Auth init error:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  fetchProfile: async (userId) => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profileError) throw profileError
      
      // If artist, get artist profile
      let artist = null
      if (profile.role === 'artist') {
        const { data: artistData } = await supabase
          .from('artists')
          .select('*')
          .eq('user_id', userId)
          .single()
        artist = artistData
      }
      
      set({ 
        user: { id: userId }, 
        profile, 
        artist 
      })
    } catch (error) {
      console.error('Fetch profile error:', error)
    }
  },
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) return { error }
    
    if (data.user) {
      await get().fetchProfile(data.user.id)
    }
    
    return { data }
  },
  
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, artist: null })
  },
  
  isStaff: () => {
    const profile = get().profile
    return profile?.role === 'admin' || profile?.role === 'manager'
  },
  
  isArtist: () => {
    const profile = get().profile
    return profile?.role === 'artist'
  }
}))
