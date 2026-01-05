import React, { useEffect, useState, useRef } from 'react'
import { Send, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { format, isToday, isYesterday } from 'date-fns'

export default function Chat() {
  const { profile, artist, isStaff, isArtist } = useAuthStore()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  
  useEffect(() => {
    if (isArtist() && artist) {
      // Artists go directly to their conversation
      fetchArtistConversation()
    } else if (isStaff()) {
      // Staff sees list of all conversations
      fetchConversations()
    }
  }, [profile, artist])
  
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages()
      subscribeToMessages()
    }
  }, [selectedConversation])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const fetchArtistConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, artist:artists(name, color)')
      .eq('artist_id', artist.id)
      .single()
    
    if (data) {
      setSelectedConversation(data)
    }
    setLoading(false)
  }
  
  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        artist:artists(id, name, color, user_id),
        messages:chat_messages(content, created_at, sender_id)
      `)
      .order('updated_at', { ascending: false })
    
    if (!error) {
      // Get last message for each conversation
      const withLastMessage = data?.map(conv => ({
        ...conv,
        lastMessage: conv.messages?.[conv.messages.length - 1]
      })) || []
      setConversations(withLastMessage)
    }
    setLoading(false)
  }
  
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users(id, display_name, role)
      `)
      .eq('conversation_id', selectedConversation.id)
      .order('created_at', { ascending: true })
    
    if (!error) {
      setMessages(data || [])
    }
  }
  
  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        async (payload) => {
          // Fetch sender info
          const { data: sender } = await supabase
            .from('users')
            .select('id, display_name, role')
            .eq('id', payload.new.sender_id)
            .single()
          
          setMessages(prev => [...prev, { ...payload.new, sender }])
        }
      )
      .subscribe()
    
    return () => supabase.removeChannel(channel)
  }
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    setSending(true)
    
    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: selectedConversation.id,
      sender_id: profile.id,
      content: newMessage.trim()
    })
    
    if (!error) {
      setNewMessage('')
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id)
    }
    
    setSending(false)
  }
  
  const formatMessageDate = (date) => {
    const d = new Date(date)
    if (isToday(d)) return format(d, 'h:mm a')
    if (isYesterday(d)) return 'Yesterday ' + format(d, 'h:mm a')
    return format(d, 'MMM d, h:mm a')
  }
  
  const isOwnMessage = (message) => message.sender_id === profile?.id
  
  // Artist view - direct chat
  if (isArtist()) {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-67-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }
    
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)]">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-67-gray">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: '#FFD700' }}
          >
            67
          </div>
          <div>
            <h2 className="font-bold text-white">67 Team</h2>
            <p className="text-xs text-gray-500">Your label management</p>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 chat-scroll">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet</p>
              <p className="text-sm mt-1">Start a conversation with your team</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const own = isOwnMessage(message)
              const showDate = index === 0 || 
                new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString()
              
              return (
                <React.Fragment key={message.id}>
                  {showDate && (
                    <div className="text-center text-xs text-gray-500 py-2">
                      {isToday(new Date(message.created_at)) ? 'Today' : 
                       isYesterday(new Date(message.created_at)) ? 'Yesterday' :
                       format(new Date(message.created_at), 'MMMM d, yyyy')}
                    </div>
                  )}
                  <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${own ? 'order-2' : ''}`}>
                      {!own && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">
                          {message.sender?.display_name}
                        </p>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl ${
                        own 
                          ? 'bg-67-gold text-black rounded-br-md' 
                          : 'bg-67-dark border border-67-gray text-white rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className={`text-[10px] text-gray-500 mt-1 ${own ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatMessageDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="pt-4 border-t border-67-gray">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="px-4 py-3 bg-67-gold text-black rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // Staff view - conversation list + chat
  return (
    <div className="flex h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)] gap-4">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 flex-shrink-0`}>
        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-67-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto flex-1">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                  selectedConversation?.id === conv.id 
                    ? 'bg-67-gold/20 border border-67-gold/50' 
                    : 'bg-67-dark border border-67-gray hover:border-67-gold/30'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: conv.artist?.color || '#666' }}
                >
                  {conv.artist?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{conv.artist?.name}</p>
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-67-dark rounded-2xl border border-67-gray overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-67-gray">
            <button
              onClick={() => setSelectedConversation(null)}
              className="lg:hidden p-1 hover:bg-67-gray rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: selectedConversation.artist?.color || '#666' }}
            >
              {selectedConversation.artist?.name?.[0]}
            </div>
            <div>
              <h3 className="font-bold text-white">{selectedConversation.artist?.name}</h3>
              <p className="text-xs text-gray-500">Artist</p>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll">
            {messages.map((message, index) => {
              const own = isOwnMessage(message)
              const showDate = index === 0 || 
                new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString()
              
              return (
                <React.Fragment key={message.id}>
                  {showDate && (
                    <div className="text-center text-xs text-gray-500 py-2">
                      {isToday(new Date(message.created_at)) ? 'Today' : 
                       isYesterday(new Date(message.created_at)) ? 'Yesterday' :
                       format(new Date(message.created_at), 'MMMM d, yyyy')}
                    </div>
                  )}
                  <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%]`}>
                      {!own && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">
                          {message.sender?.display_name}
                        </p>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl ${
                        own 
                          ? 'bg-67-gold text-black rounded-br-md' 
                          : 'bg-67-gray text-white rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className={`text-[10px] text-gray-500 mt-1 ${own ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatMessageDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-67-gray">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-67-gold"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-4 py-3 bg-67-gold text-black rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-67-dark rounded-2xl border border-67-gray">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  )
}
