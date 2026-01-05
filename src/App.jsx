import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Posts from './pages/Posts'
import PostDetail from './pages/PostDetail'
import PostEditor from './pages/PostEditor'
import Calendar from './pages/Calendar'
import Chat from './pages/Chat'
import Artists from './pages/Artists'
import Notifications from './pages/Notifications'

// Components
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-67-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-67-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-black text-67-gold">67</span>
          </div>
          <div className="w-8 h-8 border-2 border-67-gold border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function StaffRoute({ children }) {
  const { isStaff, loading } = useAuthStore()
  
  if (loading) return null
  
  if (!isStaff()) {
    return <Navigate to="/" replace />
  }
  
  return children
}

export default function App() {
  const { initialize } = useAuthStore()
  
  useEffect(() => {
    initialize()
  }, [])
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<Posts />} />
          <Route path="posts/new" element={
            <StaffRoute>
              <PostEditor />
            </StaffRoute>
          } />
          <Route path="posts/:id" element={<PostDetail />} />
          <Route path="posts/:id/edit" element={
            <StaffRoute>
              <PostEditor />
            </StaffRoute>
          } />
          <Route path="calendar" element={<Calendar />} />
          <Route path="chat" element={<Chat />} />
          <Route path="artists" element={
            <StaffRoute>
              <Artists />
            </StaffRoute>
          } />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
