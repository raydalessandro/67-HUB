import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, FileText, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Artists() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
    const { data, error } = await supabase
      .from('artists')
      .select(`
        *,
        user:users(email, display_name),
        posts:posts(count)
      `)
      .eq('is_label', false)
      .order('name')

    if (!error) {
      setArtists(data || [])
    }
    setLoading(false)
  }

  // Filter artists based on search query
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-67-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Artists</h1>
          <p className="text-gray-500 mt-1">Manage your roster</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-67-gold text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
          data-testid="create-artist"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Artist</span>
        </button>
      </div>

      {/* Search */}
      {artists.length > 0 && (
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artists..."
            className="w-full max-w-md px-4 py-2 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold transition-colors"
            data-testid="artist-search"
          />
        </div>
      )}

      {/* Artists Grid */}
      {filteredArtists.length === 0 ? (
        <div className="text-center py-16" data-testid="artists-empty">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">
            {searchQuery ? 'No artists found' : 'No artists yet'}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try a different search term' : 'Add your first artist to get started'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="artists-list">
          {filteredArtists.map(artist => (
            <div
              key={artist.id}
              className="bg-67-dark rounded-2xl border border-67-gray overflow-hidden hover:border-67-gold/50 transition-colors"
              data-testid="artist-card"
              data-artist-id={artist.id}
            >
              {/* Header with color */}
              <div
                className="h-20 relative"
                style={{ backgroundColor: artist.color || '#333' }}
                data-testid="artist-color"
              >
                <div className="absolute -bottom-8 left-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black text-white border-4 border-67-dark"
                    style={{ backgroundColor: artist.color || '#333' }}
                  >
                    {artist.name[0]}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="pt-10 p-4">
                <h3 className="text-lg font-bold text-white" data-testid="artist-name">{artist.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {artist.bio || 'No bio added yet'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-67-gray" data-testid="artist-stats">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm" data-testid="stat-total-posts">{artist.posts?.[0]?.count || 0} posts</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/posts?artist=${artist.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-67-gray text-white text-sm font-medium rounded-lg hover:bg-67-gray/80 transition-colors"
                    data-testid="artist-posts"
                  >
                    View Posts
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/chat`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-67-gold text-black text-sm font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                    data-testid="open-artist-chat"
                  >
                    Message
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
