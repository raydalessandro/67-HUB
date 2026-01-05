import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchNotifications: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (!error && data) {
      const unreadCount = data.filter(n => !n.read).length
      set({ notifications: data, unreadCount })
    }
  },
  
  markAsRead: async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    
    if (!error) {
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    }
  },
  
  markAllAsRead: async (userId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    
    if (!error) {
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }))
    }
  },
  
  subscribeToNotifications: (userId) => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          set(state => ({
            notifications: [payload.new, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }))
        }
      )
      .subscribe()
    
    return () => supabase.removeChannel(channel)
  }
}))
