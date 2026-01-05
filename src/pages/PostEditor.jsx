import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  X, 
  Upload,
  Calendar,
  Loader2
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
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">
          {isEditing ? 'Edit Post' : 'New Post'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Artist Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Artist *
          </label>
          <select
            value={form.artist_id}
            onChange={(e) => setForm({ ...form, artist_id: e.target.value })}
            required
            className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white focus:outline-none focus:border-67-gold"
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
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="Post title (internal reference)"
            className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold"
          />
        </div>
        
        {/* Platform */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Platform *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {platforms.map(platform => (
              <button
                key={platform.value}
                type="button"
                onClick={() => setForm({ ...form, platform: platform.value })}
                className={`px-4 py-3 rounded-xl border font-medium transition-colors ${
                  form.platform === platform.value
                    ? 'bg-67-gold text-black border-67-gold'
                    : 'bg-67-dark text-gray-400 border-67-gray hover:border-67-gold/50'
                }`}
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
          </label>
          <textarea
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
            placeholder="Write your caption here..."
            rows={5}
            className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {form.caption.length} characters
          </p>
        </div>
        
        {/* Hashtags */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Hashtags
          </label>
          <input
            type="text"
            value={form.hashtags}
            onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
            placeholder="#music #newrelease #67"
            className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold"
          />
        </div>
        
        {/* Scheduled Date */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Schedule For
          </label>
          <input
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white focus:outline-none focus:border-67-gold"
          />
        </div>
        
        {/* Media Upload (placeholder) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Media
          </label>
          <div className="border-2 border-dashed border-67-gray rounded-xl p-8 text-center hover:border-67-gold/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">
              Drag and drop or click to upload
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
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !form.title || !form.artist_id}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-67-gold text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
