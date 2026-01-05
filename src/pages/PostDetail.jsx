import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  Calendar,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Play,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { format } from 'date-fns'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, isStaff, isArtist } = useAuthStore()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchPost()
    fetchComments()
    fetchHistory()
  }, [id])

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        artist:artists(id, name, color, user_id),
        created_by_user:users!posts_created_by_fkey(display_name),
        media:post_media(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching post:', error)
      navigate('/posts')
      return
    }

    setPost(data)
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('post_comments')
      .select(`
        *,
        user:users(display_name)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true })

    setComments(data || [])
  }

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('post_history')
      .select(`
        *,
        user:users(display_name)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: false })

    setHistory(data || [])
  }

  const handleApprove = async () => {
    setActionLoading(true)

    const { error } = await supabase
      .from('posts')
      .update({
        status: 'approved',
        approved_by: profile.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)

    if (!error) {
      // Add to history
      await supabase.from('post_history').insert({
        post_id: id,
        user_id: profile.id,
        action: 'approved',
        details: { from_status: 'in_review', to_status: 'approved' }
      })

      fetchPost()
      fetchHistory()
    }

    setActionLoading(false)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return

    setActionLoading(true)

    const { error } = await supabase
      .from('posts')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason
      })
      .eq('id', id)

    if (!error) {
      // Add to history
      await supabase.from('post_history').insert({
        post_id: id,
        user_id: profile.id,
        action: 'rejected',
        details: {
          from_status: 'in_review',
          to_status: 'rejected',
          rejection_reason: rejectionReason
        }
      })

      // Add system comment
      await supabase.from('post_comments').insert({
        post_id: id,
        user_id: profile.id,
        content: `Post rejected: ${rejectionReason}`,
        is_system: true
      })

      setShowRejectModal(false)
      setRejectionReason('')
      fetchPost()
      fetchHistory()
      fetchComments()
    }

    setActionLoading(false)
  }

  const handleSendToReview = async () => {
    setActionLoading(true)

    const { error } = await supabase
      .from('posts')
      .update({ status: 'in_review' })
      .eq('id', id)

    if (!error) {
      await supabase.from('post_history').insert({
        post_id: id,
        user_id: profile.id,
        action: 'in_review',
        details: { from_status: post.status, to_status: 'in_review' }
      })

      fetchPost()
      fetchHistory()
    }

    setActionLoading(false)
  }

  const handleMarkPublished = async () => {
    setActionLoading(true)

    const { error } = await supabase
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)

    if (!error) {
      await supabase.from('post_history').insert({
        post_id: id,
        user_id: profile.id,
        action: 'published',
        details: { from_status: 'approved', to_status: 'published' }
      })

      fetchPost()
      fetchHistory()
    }

    setActionLoading(false)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    const { error } = await supabase.from('post_comments').insert({
      post_id: id,
      user_id: profile.id,
      content: newComment
    })

    if (!error) {
      setNewComment('')
      fetchComments()
    }
  }

  const statusConfig = {
    draft: { icon: FileText, color: 'bg-gray-500', textColor: 'text-gray-400', label: 'Draft' },
    in_review: { icon: Clock, color: 'bg-yellow-500', textColor: 'text-yellow-400', label: 'In Review' },
    approved: { icon: CheckCircle, color: 'bg-green-500', textColor: 'text-green-400', label: 'Approved' },
    rejected: { icon: XCircle, color: 'bg-red-500', textColor: 'text-red-400', label: 'Rejected' },
    published: { icon: TrendingUp, color: 'bg-blue-500', textColor: 'text-blue-400', label: 'Published' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-67-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) return null

  const config = statusConfig[post.status]
  const StatusIcon = config.icon
  const canApprove = isArtist() && post.status === 'in_review'
  const canSendToReview = isStaff() && (post.status === 'draft' || post.status === 'rejected')
  const canMarkPublished = isStaff() && post.status === 'approved'
  const canEdit = isStaff() && post.status !== 'published'

  return (
    <div className="space-y-6 pb-20 lg:pb-0" data-testid="post-detail">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/posts')}
          className="p-2 hover:bg-67-dark rounded-lg transition-colors"
          data-testid="back-button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white" data-testid="post-title">{post.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`flex items-center gap-1 text-sm ${config.textColor}`} data-testid="post-status">
              <StatusIcon className="w-4 h-4" />
              {config.label}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-sm text-gray-500" data-testid="post-platform">{post.platform.replace('_', ' ')}</span>
          </div>
        </div>
        {canEdit && (
          <Link
            to={`/posts/${id}/edit`}
            className="p-2 hover:bg-67-dark rounded-lg transition-colors"
            data-testid="edit-button"
          >
            <Edit className="w-5 h-5 text-gray-400" />
          </Link>
        )}
      </div>

      {/* Action Banner for Artists */}
      {canApprove && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">This post needs your approval</h3>
              <p className="text-sm text-gray-400 mb-4">
                Review the content below and approve or reject it.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50"
                  data-testid="approve-button"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  data-testid="reject-button"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {post.status === 'rejected' && post.rejection_reason && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4" data-testid="rejection-reason">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-400 mb-1">Rejection Reason</h3>
              <p className="text-gray-300">{post.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Preview */}
          {post.media && post.media.length > 0 && (
            <div className="bg-67-dark rounded-2xl border border-67-gray overflow-hidden">
              <div className="aspect-square bg-67-gray flex items-center justify-center">
                {post.media[0].type === 'image' ? (
                  <img
                    src={post.media[0].url}
                    alt="Post media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Play className="w-12 h-12" />
                    <span>Video Preview</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Caption */}
          <div className="bg-67-dark rounded-2xl border border-67-gray p-4" data-testid="post-caption-section">
            <h3 className="font-bold text-white mb-3">Caption</h3>
            <p className="text-gray-300 whitespace-pre-wrap" data-testid="post-caption">{post.caption || 'No caption'}</p>
            {post.hashtags && (
              <p className="mt-3 text-67-gold" data-testid="post-hashtags">{post.hashtags}</p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-67-dark rounded-2xl border border-67-gray p-4" data-testid="comments-section">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({comments.length})
            </h3>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto chat-scroll">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet</p>
              ) : (
                comments.map(comment => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-xl ${comment.is_system ? 'bg-red-500/10 border border-red-500/20' : 'bg-67-gray'}`}
                    data-testid="comment-item"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">
                        {comment.user?.display_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className={`text-sm ${comment.is_system ? 'text-red-400' : 'text-gray-300'}`}>
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 bg-67-gray border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                data-testid="comment-input"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="p-2 bg-67-gold text-black rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="comment-submit"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <div className="bg-67-dark rounded-2xl border border-67-gray p-4">
            <h3 className="font-bold text-white mb-4">Details</h3>
            <div className="space-y-3">
              {isStaff() && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Artist</p>
                  <p
                    className="font-medium mt-0.5"
                    style={{ color: post.artist?.color || '#fff' }}
                    data-testid="post-artist"
                  >
                    {post.artist?.name}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Platform</p>
                <p className="text-white font-medium mt-0.5 capitalize">{post.platform.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Created By</p>
                <p className="text-white font-medium mt-0.5">{post.created_by_user?.display_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Created</p>
                <p className="text-white font-medium mt-0.5">
                  {format(new Date(post.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              {post.scheduled_at && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Scheduled For</p>
                  <p className="text-white font-medium mt-0.5 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-67-gold" />
                    {format(new Date(post.scheduled_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Staff Actions */}
          {isStaff() && (
            <div className="bg-67-dark rounded-2xl border border-67-gray p-4">
              <h3 className="font-bold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                {canSendToReview && (
                  <button
                    onClick={handleSendToReview}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                    data-testid="send-review-button"
                  >
                    <Clock className="w-5 h-5" />
                    Send to Review
                  </button>
                )}
                {canMarkPublished && (
                  <button
                    onClick={handleMarkPublished}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-colors disabled:opacity-50"
                    data-testid="mark-published-button"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Mark as Published
                  </button>
                )}
              </div>
            </div>
          )}

          {/* History */}
          <div className="bg-67-dark rounded-2xl border border-67-gray p-4">
            <h3 className="font-bold text-white mb-4">History</h3>
            <div className="space-y-3" data-testid="history-list">
              {history.map((item, index) => (
                <div key={item.id} className="flex gap-3" data-testid="history-entry">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${statusConfig[item.action]?.color || 'bg-gray-500'}`} />
                    {index < history.length - 1 && (
                      <div className="w-px h-full bg-67-gray mt-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm text-white capitalize">{item.action.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">
                      {item.user?.display_name} · {format(new Date(item.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-67-dark rounded-2xl border border-67-gray p-6 animate-fadeIn" data-testid="reject-modal">
            <h3 className="text-lg font-bold text-white mb-4">Reject Post</h3>
            <p className="text-gray-400 text-sm mb-4">
              Please provide a reason for rejecting this post. This will help the team make improvements.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why you're rejecting this post..."
              className="w-full h-32 px-4 py-3 bg-67-gray border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
              data-testid="reject-reason-input"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-67-gray text-white font-bold rounded-xl hover:bg-67-gray/80 transition-colors"
                data-testid="reject-cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 transition-colors disabled:opacity-50"
                data-testid="reject-confirm-button"
              >
                Reject Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
