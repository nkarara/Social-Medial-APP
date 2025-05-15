import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { messagesService, Message, Conversation } from '@/services/messagesService';
import { profileService } from '@/services/profileService';
import { socialService } from '@/services/socialService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessagesSquare, Send, Search, User } from 'lucide-react';
import supabase from '@/lib/supabase';
import { Profile } from '@/types/supabase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';

const MessagesPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle incoming conversation from state (when redirected from profile)
  useEffect(() => {
    if (location.state?.conversationUserId) {
      setSelectedConversation(location.state?.conversationUserId);
    }
  }, [location.state]);
  
  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await messagesService.fetchConversations(user.id);
        setConversations(data);
        
        // If conversation ID is passed from location state, select it
        if (location.state?.conversationUserId) {
          setSelectedConversation(location.state.conversationUserId);
        } 
        // Otherwise select the first one if none is selected yet
        else if (!selectedConversation && data.length > 0) {
          setSelectedConversation(data[0].user.id);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
    
    // Subscribe to new messages for real-time updates
    const messagesChannel = supabase
      .channel('messages_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        console.log('New message received:', payload);
        loadConversations();
        
        // If this message is part of the current conversation, update messages list
        const message = payload.new as Message;
        if (
          selectedConversation && 
          ((message.sender_id === user?.id && message.receiver_id === selectedConversation) ||
           (message.sender_id === selectedConversation && message.receiver_id === user?.id))
        ) {
          // Fetch complete message with profiles
          messagesService.fetchMessages(user!.id, selectedConversation)
            .then(updatedMessages => {
              setMessages(updatedMessages);
            });
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, location.state, selectedConversation]);
  
  // Load messages for selected conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !selectedConversation) return;
      
      try {
        const data = await messagesService.fetchMessages(user.id, selectedConversation);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    
    if (selectedConversation) {
      loadMessages();
    }
    
  }, [user, selectedConversation]);
  
  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;
    
    try {
      const sentMessage = await messagesService.sendMessage(
        user.id,
        selectedConversation,
        newMessage.trim()
      );
      
      if (sentMessage) {
        // Clear input field immediately for better UX
        setNewMessage('');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to send message',
        description: error.message || 'An unknown error occurred'
      });
    }
  };
  
  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Search for followed users
      const following = await socialService.getFollowing(user.id);
      
      // Filter followed users based on search query
      const filtered = following.filter(profile => 
        profile.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (profile.full_name && profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const startConversation = async (userId: string) => {
    setSelectedConversation(userId);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  if (!user) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              Please log in to use the messaging feature.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <Card className="min-h-[600px] flex flex-col md:flex-row">
        {/* Conversations sidebar */}
        <div className="w-full md:w-1/3 border-r">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessagesSquare className="h-5 w-5 mr-2" />
              Messages
            </CardTitle>
            
            <div className="mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex">
                    <Input
                      placeholder="Search users you follow..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-32px)] md:w-[300px]" align="start">
                  {isSearching ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-[300px] overflow-auto">
                      {searchResults.map((profile) => (
                        <div 
                          key={profile.id} 
                          className="flex items-center p-2 hover:bg-accent cursor-pointer rounded-md"
                          onClick={() => startConversation(profile.id)}
                        >
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback>
                              {profile.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{profile.username}</p>
                            {profile.full_name && (
                              <p className="text-xs text-muted-foreground">{profile.full_name}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <p className="text-center py-4 text-muted-foreground">No users found</p>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      Search for users you follow
                    </p>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          
          <div className="overflow-y-auto h-[500px] border-t">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : conversations.length > 0 ? (
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.user.id}
                    className={`flex items-start p-3 cursor-pointer hover:bg-accent transition-colors ${
                      selectedConversation === conversation.user.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.user.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={conversation.user.avatar_url || undefined} />
                        <AvatarFallback>
                          {conversation.user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {conversation.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-baseline justify-between">
                        <p className="font-medium truncate">{conversation.user.username}</p>
                        <p className="text-xs text-muted-foreground ml-2">
                          {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message.sender_id === user.id ? 'You: ' : ''}
                        {conversation.last_message.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No conversations yet. Start by following users you want to message.
              </div>
            )}
          </div>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b">
                {conversations.find(c => c.user.id === selectedConversation)?.user && (
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage 
                        src={conversations.find(c => c.user.id === selectedConversation)?.user.avatar_url || undefined} 
                      />
                      <AvatarFallback>
                        {conversations.find(c => c.user.id === selectedConversation)?.user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {conversations.find(c => c.user.id === selectedConversation)?.user.username}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-muted/20 space-y-4">
                {messages.length > 0 ? (
                  messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender_id === user.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message input */}
              <div className="p-4 border-t flex">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 mr-2"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <User className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <p>Select a conversation to start chatting</p>
              <p className="text-sm mt-2">or search for users you follow</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MessagesPage;
