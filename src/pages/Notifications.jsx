import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageCircle,
  Check
} from 'lucide-react'
import { useNotificationStore } from '../stores/notificationStore'
import { useAuthStore } from '../stores/authStore'
import { format, formatDistanceToNow } from 'date-fns'

export default function Notifications() {
  const { profile } = useAuthStore()
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore()
  
  useEffect(() => {
    if (profile?.id) {
      fetchNotifications(profile.id)
    }
  }, [profile?.id])
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'post_review':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'post_approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'post_rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'chat_message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }
  
  const getNotificationLink = (notification) => {
    if (notification.data?.post_id) {
      return `/posts/${notification.data.post_id}`
    }
    if (notification.data?.conversation_id) {
      return '/chat'
    }
    return '#'
  }
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead(profile.id)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-67-gold hover:bg-67-dark rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>
      
      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No notifications</h3>
          <p className="text-gray-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => (
            <Link
              key={notification.id}
              to={getNotificationLink(notification)}
              onClick={() => !notification.read && markAsRead(notification.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                notification.read 
                  ? 'bg-67-dark border-67-gray' 
                  : 'bg-67-gold/10 border-67-gold/30 hover:bg-67-gold/20'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                  {notification.body}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-67-gold rounded-full flex-shrink-0 mt-2" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
