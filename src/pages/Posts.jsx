import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Filter,
  Search
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { format } from 'date-fns'

export default function Posts() {
  const { profile, artist, isStaff, isArtist } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const statusFilter = searchParams.get('status') || 'all'
  const artistFilter = searchParams.get('artist') || 'all'
  
  useEffect(() => {
    fetchPosts()
    if (isStaff()) fetchArtists()
  }, [profile, artist, statusFilter, artistFilter])
  
  const fetchArtists = async () => {
    const { data } = await supabase
      .from('artists')
      .select('id, name')
      .eq('is_label', false)
      .order('name')
    setArtists(data || [])
  }
  
  const fetchPosts = async () => {
    if (!profile) return
    
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          artist:artists(id, name, color)
        `)
        .order('created_at', { ascending: false })
      
      // Filter by artist if user is artist
      if (isArtist() && artist) {
        query = query.eq('artist_id', artist.id)
      } else if (artistFilter !== 'all') {
        query = query.eq('artist_id', artistFilter)
      }
      
      // Filter by status
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true
    return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.caption?.toLowerCase().includes(searchQuery.toLowerCase())
  })
  
  const statusConfig = {
    draft: { icon: FileText, color: 'bg-gray-500', label: 'Draft' },
    in_review: { icon: Clock, color: 'bg-yellow-500', label: 'In Review' },
    approved: { icon: CheckCircle, color: 'bg-green-500', label: 'Approved' },
    rejected: { icon: XCircle, color: 'bg-red-500', label: 'Rejected' },
    published: { icon: TrendingUp, color: 'bg-blue-500', label: 'Published' },
  }
  
  const platformLabels = {
    instagram_feed: 'IG Feed',
    instagram_story: 'IG Story',
    instagram_reel: 'IG Reel',
    tiktok: 'TikTok',
    youtube: 'YouTube',
  }
  
  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {isArtist() ? 'My Posts' : 'Posts'}
        </h1>
        {isStaff() && (
          <Link
            to="/posts/new"
            className="flex items-center gap-2 px-4 py-2 bg-67-gold text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Post</span>
          </Link>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold"
          />
        </div>
        
        {/* Status Filter */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setSearchParams(prev => {
              prev.set('status', e.target.value)
              return prev
            })}
            className="px-4 py-2.5 bg-67-dark border border-67-gray rounded-xl text-white focus:outline-none focus:border-67-gold"
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </select>
          
          {/* Artist Filter - Staff only */}
          {isStaff() && artists.length > 0 && (
            <select
              value={artistFilter}
              onChange={(e) => setSearchParams(prev => {
                prev.set('artist', e.target.value)
                return prev
              })}
              className="px-4 py-2.5 bg-67-dark border border-67-gray rounded-xl text-white focus:outline-none focus:border-67-gold"
            >
              <option value="all">All Artists</option>
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-67-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No posts found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : isStaff() 
                ? 'Create your first post to get started' 
                : 'No posts have been created for you yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPosts.map(post => {
            const config = statusConfig[post.status]
            const Icon = config.icon
            
            return (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="flex items-center gap-4 p-4 bg-67-dark rounded-xl border border-67-gray hover:border-67-gold/50 transition-all hover:scale-[1.01]"
              >
                {/* Status Icon */}
                <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white truncate">{post.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      post.platform === 'tiktok' 
                        ? 'bg-black border border-white/20 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    }`}>
                      {platformLabels[post.platform]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {post.caption || 'No caption'}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {isStaff() && post.artist && (
                      <span 
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: post.artist.color + '30', color: post.artist.color }}
                      >
                        {post.artist.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </span>
                    {post.scheduled_at && (
                      <span className="text-xs text-gray-500">
                        · Scheduled: {format(new Date(post.scheduled_at), 'MMM d, h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action indicator for artists */}
                {isArtist() && post.status === 'in_review' && (
                  <div className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-full">
                    Review
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
