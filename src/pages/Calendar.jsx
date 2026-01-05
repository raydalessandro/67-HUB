import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns'

export default function Calendar() {
  const { profile, artist, isArtist, isStaff } = useAuthStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [posts, setPosts] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterArtist, setFilterArtist] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [artists, setArtists] = useState([])

  useEffect(() => {
    fetchArtists()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [profile, artist, currentMonth, filterArtist, filterPlatform, filterStatus])

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

    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)

    let query = supabase
      .from('posts')
      .select(`
        id, title, status, platform, scheduled_at, artist_id,
        artist:artists(name, color)
      `)
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())

    if (isArtist() && artist) {
      query = query.eq('artist_id', artist.id)
    }

    // Apply filters
    if (filterArtist) {
      query = query.eq('artist_id', filterArtist)
    }
    if (filterPlatform) {
      query = query.eq('platform', filterPlatform)
    }
    if (filterStatus) {
      query = query.eq('status', filterStatus)
    }

    const { data, error } = await query.order('scheduled_at')

    if (!error) {
      setPosts(data || [])
    }
    setLoading(false)
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getPostsForDay = (date) => {
    return posts.filter(post =>
      post.scheduled_at && isSameDay(new Date(post.scheduled_at), date)
    )
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  const clearFilters = () => {
    setFilterArtist('')
    setFilterPlatform('')
    setFilterStatus('')
  }

  const hasActiveFilters = filterArtist || filterPlatform || filterStatus

  const statusColors = {
    draft: 'bg-gray-500',
    in_review: 'bg-yellow-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    published: 'bg-blue-500',
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="space-y-4 pb-20 lg:pb-0" data-testid="calendar-view">
      {/* Header with Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm text-67-gold hover:bg-67-dark rounded-lg transition-colors"
              data-testid="calendar-today"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-67-dark rounded-lg transition-colors"
              data-testid="calendar-prev"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span
              className="text-white font-medium min-w-[140px] text-center"
              data-testid="calendar-month-title"
            >
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-67-dark rounded-lg transition-colors"
              data-testid="calendar-next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {isStaff() && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterArtist}
              onChange={(e) => setFilterArtist(e.target.value)}
              className="px-3 py-2 bg-67-dark border border-67-gray rounded-xl text-white text-sm focus:outline-none focus:border-67-gold transition-colors"
              data-testid="filter-artist"
            >
              <option value="">All Artists</option>
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 bg-67-dark border border-67-gray rounded-xl text-white text-sm focus:outline-none focus:border-67-gold transition-colors"
              data-testid="filter-platform"
            >
              <option value="">All Platforms</option>
              <option value="instagram_post">Instagram Post</option>
              <option value="instagram_story">Instagram Story</option>
              <option value="instagram_reel">Instagram Reel</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="spotify">Spotify</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-67-dark border border-67-gray rounded-xl text-white text-sm focus:outline-none focus:border-67-gold transition-colors"
              data-testid="filter-status"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-67-dark rounded-lg transition-colors"
                data-testid="clear-filters"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="bg-67-dark rounded-2xl border border-67-gray overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-67-gray">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayPosts = getPostsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const today = isToday(day)
            const dayNumber = format(day, 'd')

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(isSameDay(day, selectedDate) ? null : day)}
                className={`min-h-[80px] lg:min-h-[100px] p-1 border-b border-r border-67-gray text-left transition-colors ${
                  !isCurrentMonth ? 'bg-67-black/50' : ''
                } ${isSelected ? 'bg-67-gold/10' : 'hover:bg-67-gray/50'}`}
                data-testid={today ? 'calendar-today-cell' : 'calendar-day-cell'}
                data-day={dayNumber}
              >
                <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                  today ? 'bg-67-gold text-white' : isCurrentMonth ? 'text-white' : 'text-gray-600'
                }`}>
                  {dayNumber}
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map(post => (
                    <div
                      key={post.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate ${statusColors[post.status]} text-white`}
                      title={post.title}
                      data-testid="calendar-event"
                      data-post-id={post.id}
                      data-status={post.status}
                      data-platform={post.platform}
                    >
                      <span className="hidden lg:inline" data-testid="event-title">{post.title}</span>
                      <span className="lg:hidden">•</span>
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <div className="text-[10px] text-gray-500 px-1">
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDate && (
        <div className="bg-67-dark rounded-2xl border border-67-gray p-4">
          <h3 className="font-bold text-white mb-3">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>

          {getPostsForDay(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-sm">No posts scheduled for this day</p>
          ) : (
            <div className="space-y-2">
              {getPostsForDay(selectedDate).map(post => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="flex items-center gap-3 p-3 bg-67-gray rounded-xl hover:bg-67-gray/80 transition-colors"
                  data-testid="calendar-event"
                  data-post-id={post.id}
                >
                  <div className={`w-3 h-3 rounded-full ${statusColors[post.status]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate" data-testid="event-title">{post.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(post.scheduled_at), 'h:mm a')} · {post.platform.replace('_', ' ')}
                    </p>
                  </div>
                  {post.artist && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: post.artist.color + '30', color: post.artist.color }}
                    >
                      {post.artist.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-gray-400">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-400">In Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-400">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-400">Published</span>
        </div>
      </div>
    </div>
  )
}
