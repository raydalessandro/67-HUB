import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  Upload,
  Calendar,
  Loader2,
  Lock,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [artists, setArtists] = useState([])
  const [postStatus, setPostStatus] = useState(null)

  const [form, setForm] = useState({
    title: '',
    caption: '',
    hashtags: '',
    platform: 'instagram_feed',
    artist_id: '',
    scheduled_at: ''
  })

  useEffect(() => {
    fetchArtists()
    if (isEditing) fetchPost()
  }, [id])

  const fetchArtists = async () => {
    const { data } = await supabase
      .from('artists')
      .select('id, name, color')
      .eq('is_label', false)
      .order('name')
    setArtists(data || [])

    // Set default artist if only one
    if (!isEditing && data?.length === 1) {
      setForm(f => ({ ...f, artist_id: data[0].id }))
    }
  }

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      navigate('/posts')
      return
    }

    setPostStatus(data.status)
    setForm({
      title: data.title,
      caption: data.caption || '',
      hashtags: data.hashtags || '',
      platform: data.platform,
      artist_id: data.artist_id,
      scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : ''
    })
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const postData = {
      title: form.title,
      caption: form.caption || null,
      hashtags: form.hashtags || null,
      platform: form.platform,
      artist_id: form.artist_id,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
    }

    let result

    if (isEditing) {
      result = await supabase
        .from('posts')
        .update(postData)
        .eq('id', id)
    } else {
      result = await supabase
        .from('posts')
        .insert({
          ...postData,
          status: 'draft',
          created_by: profile.id
        })
        .select()
        .single()

      // Add history entry
      if (result.data) {
        await supabase.from('post_history').insert({
          post_id: result.data.id,
          user_id: profile.id,
          action: 'created',
          details: {}
        })
      }
    }

    if (result.error) {
      console.error('Error saving post:', result.error)
      setSaving(false)
      return
    }

    navigate(isEditing ? `/posts/${id}` : '/posts')
  }

  const platforms = [
    { value: 'instagram_feed', label: 'Instagram Feed' },
    { value: 'instagram_story', label: 'Instagram Story' },
    { value: 'instagram_reel', label: 'Instagram Reel' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
  ]

  // Content Locking: Can only edit if draft or rejected
  const isLocked = isEditing && postStatus && !['draft', 'rejected'].includes(postStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-67-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-67-dark rounded-lg transition-colors"
          data-testid="back-button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">
          {isEditing ? 'Edit Post' : 'New Post'}
        </h1>
      </div>

      {/* Content Locked Warning */}
      {isLocked && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4" data-testid="content-locked-message">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-500 mb-1">Content Locked</h3>
              <p className="text-sm text-gray-400">
                This post is currently <span className="font-medium text-white capitalize">{postStatus?.replace('_', ' ')}</span> and cannot be edited.
                Only posts in Draft or Rejected status can be modified.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="post-form">
        {/* Artist Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Artist *
            {isLocked && <Lock className="w-3 h-3 inline ml-1 text-yellow-500" />}
          </label>
          <select
            value={form.artist_id}
            onChange={(e) => setForm({ ...form, artist_id: e.target.value })}
            required
            disabled={isLocked}
            className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white focus:outline-none focus:border-67-gold disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="artist-input"
          >
            <option value="">Select artist...</option>
            {artists.map(artist => (
              <option key={artist.id} value={artist.id}>{artist.name}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Title *
            {isLocked && <Lock className="w-3 h-3 inline ml-1 text-yellow-500" />}
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            disabled={isLocked}
            placeholder="Post title (internal reference)"
            className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="title-input"
          />
        </div>

        {/* Platform */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Platform *
            {isLocked && <Lock className="w-3 h-3 inline ml-1 text-yellow-500" />}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {platforms.map(platform => (
              <button
                key={platform.value}
                type="button"
                onClick={() => !isLocked && setForm({ ...form, platform: platform.value })}
                disabled={isLocked}
                className={`px-4 py-3 rounded-xl border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  form.platform === platform.value
                    ? 'bg-67-gold text-white border-67-gold'
                    : 'bg-67-dark text-gray-400 border-67-gray hover:border-67-gold/50'
                }`}
                data-testid={`platform-button-${platform.value}`}
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Caption
            {isLocked && <Lock className="w-3 h-3 inline ml-1 text-yellow-500" />}
          </label>
          <textarea
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
            placeholder="Write your caption here..."
            rows={5}
            disabled={isLocked}
            className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="caption-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            {form.caption.length} characters
          </p>
        </div>

        {/* Hashtags */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Hashtags
            {isLocked && <Lock className="w-3 h-3 inline ml-1 text-yellow-500" />}
          </label>
          <input
            type="text"
            value={form.hashtags}
            onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
            placeholder="#music #newrelease #67"
            disabled={isLocked}
            className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="hashtags-input"
          />
        </div>

        {/* Scheduled Date */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Schedule For
            {isLocked && <Lock className="w-3 h-3 inline ml-1 text-yellow-500" />}
          </label>
          <input
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            disabled={isLocked}
            className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white focus:outline-none focus:border-67-gold disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="scheduled-input"
          />
        </div>

        {/* Media Upload (placeholder) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Media
            {isLocked && <Lock className="w-3 h-3 inline ml-1 text-yellow-500" />}
          </label>
          <div
            className={`border-2 border-dashed border-67-gray rounded-xl p-8 text-center transition-colors ${
              isLocked
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-67-gold/50 cursor-pointer'
            }`}
            data-testid="media-upload"
          >
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">
              {isLocked ? 'Media upload locked' : 'Drag and drop or click to upload'}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Images, videos up to 100MB
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-3 bg-67-gray text-white font-bold rounded-xl hover:bg-67-gray/80 transition-colors"
            data-testid="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !form.title || !form.artist_id || isLocked}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-67-gold text-white font-bold rounded-xl hover:bg-67-amber transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="submit-button"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditing ? 'Save Changes' : 'Create Post'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
