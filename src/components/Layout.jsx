import React, { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  MessageCircle, 
  Users, 
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

export default function Layout() {
  const { profile, artist, signOut, isStaff } = useAuthStore()
  const { unreadCount, fetchNotifications, subscribeToNotifications } = useNotificationStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = React.useState(false)
  
  useEffect(() => {
    if (profile?.id) {
      fetchNotifications(profile.id)
      const unsubscribe = subscribeToNotifications(profile.id)
      return unsubscribe
    }
  }, [profile?.id])
  
  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }
  
  const staffNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/posts', icon: FileText, label: 'Posts' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/artists', icon: Users, label: 'Artists' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
  ]
  
  const artistNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/posts', icon: FileText, label: 'My Posts' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
  ]
  
  const navItems = isStaff() ? staffNavItems : artistNavItems
  
  return (
    <div className="min-h-screen bg-67-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-67-black/95 backdrop-blur-lg border-b border-67-gray safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 hover:bg-67-dark rounded-lg"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-67-dark rounded-lg flex items-center justify-center">
                <span className="text-sm font-black text-67-gold">67</span>
              </div>
              <span className="font-bold text-white hidden sm:block">Hub</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <NavLink
              to="/notifications"
              className="relative p-2 hover:bg-67-dark rounded-lg"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
            
            {/* Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-67-gray">
              <div className="w-8 h-8 rounded-full bg-67-gold flex items-center justify-center">
                <span className="text-sm font-bold text-black">
                  {profile?.display_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white leading-tight">
                  {artist?.name || profile?.display_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-67-dark border-r border-67-gray">
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-67-gold text-black font-bold' 
                      : 'text-gray-400 hover:bg-67-gray hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 border-t border-67-gray">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-67-gray hover:text-white rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>
        
        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="absolute inset-0 bg-black/60"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-67-dark animate-fadeIn">
              <div className="p-4 border-b border-67-gray">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-67-gold flex items-center justify-center">
                    <span className="font-bold text-black">
                      {profile?.display_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {artist?.name || profile?.display_name}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4 space-y-1">
                {navItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-67-gold text-black font-bold' 
                          : 'text-gray-400 hover:bg-67-gray hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-67-gray safe-bottom">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-67-gray hover:text-white rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Bottom Nav - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-67-dark border-t border-67-gray safe-bottom">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-67-gold' 
                    : 'text-gray-500'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
