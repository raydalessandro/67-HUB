import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { format } from 'date-fns'

export default function Dashboard() {
  const { profile, artist, isStaff, isArtist } = useAuthStore()
  const [stats, setStats] = useState({ draft: 0, in_review: 0, approved: 0, rejected: 0, published: 0 })
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [profile, artist])

  const fetchDashboardData = async () => {
    if (!profile) return

    try {
      let query = supabase.from('posts').select('*', { count: 'exact' })

      // Filter by artist if user is artist
      if (isArtist() && artist) {
        query = query.eq('artist_id', artist.id)
      }

      const { data: posts, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Calculate stats
      const newStats = { draft: 0, in_review: 0, approved: 0, rejected: 0, published: 0 }
      posts?.forEach(post => {
        if (newStats.hasOwnProperty(post.status)) {
          newStats[post.status]++
        }
      })

      setStats(newStats)
      setRecentPosts(posts?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    draft: { icon: FileText, color: 'bg-gray-500', label: 'Draft' },
    in_review: { icon: Clock, color: 'bg-yellow-500', label: 'In Review' },
    approved: { icon: CheckCircle, color: 'bg-green-500', label: 'Approved' },
    rejected: { icon: XCircle, color: 'bg-red-500', label: 'Rejected' },
    published: { icon: TrendingUp, color: 'bg-blue-500', label: 'Published' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-67-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="space-y-6 pb-20 lg:pb-0"
      data-testid={isStaff() ? 'staff-dashboard' : 'artist-dashboard'}
    >
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white" data-testid="welcome-message">
          Welcome back, {artist?.name || profile?.display_name}
        </h1>
        <p className="text-gray-500 mt-1">
          {isStaff() ? 'Here\'s what\'s happening with your artists.' : 'Here\'s your content overview.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" data-testid="quick-stats">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon
          const count = stats[status]

          // For artists, highlight in_review (action needed)
          const isHighlighted = isArtist() && status === 'in_review' && count > 0

          // Map to test IDs
          const testIdMap = {
            'draft': 'stat-draft',
            'in_review': 'stat-pending',
            'approved': 'stat-approved',
            'rejected': 'stat-rejected',
            'published': 'stat-published-week'
          }

          return (
            <Link
              key={status}
              to={`/posts?status=${status}`}
              className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
                isHighlighted
                  ? 'bg-yellow-500/20 border-yellow-500/50'
                  : 'bg-67-dark border-67-gray hover:border-67-gold/50'
              }`}
              data-testid={testIdMap[status]}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-sm text-gray-500">{config.label}</p>
              {isHighlighted && (
                <p className="text-xs text-yellow-400 mt-1 font-medium">Action needed</p>
              )}
            </Link>
          )
        })}
      </div>

      {/* Quick Actions for Artists - Pending Approvals */}
      {isArtist() && stats.in_review > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4" data-testid="pending-my-approval">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <div className="flex-1">
              <h3 className="font-bold text-white">Posts waiting for your approval</h3>
              <p className="text-sm text-gray-400">
                You have <span data-testid="pending-count">{stats.in_review}</span> post{stats.in_review > 1 ? 's' : ''} to review
              </p>
            </div>
            <Link
              to="/posts?status=in_review"
              className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
            >
              Review
            </Link>
          </div>
        </div>
      )}

      {/* Recent Posts */}
      <div data-testid="recent-posts">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Posts</h2>
          <Link
            to="/posts"
            className="text-sm text-67-gold hover:underline flex items-center gap-1"
            data-testid="view-all-posts"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-2">
          {recentPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No posts yet
            </div>
          ) : (
            recentPosts.map(post => {
              const config = statusConfig[post.status]
              const Icon = config.icon

              return (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="flex items-center gap-4 p-4 bg-67-dark rounded-xl border border-67-gray hover:border-67-gold/50 transition-colors"
                  data-testid="post-card"
                  data-post-id={post.id}
                >
                  <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{post.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(post.created_at), 'MMM d, yyyy')} · {post.platform.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
