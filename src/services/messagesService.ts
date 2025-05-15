
import { toast } from '@/components/ui/use-toast';
import { Profile } from '@/types/supabase';
import supabase from '@/lib/supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: Profile;
  receiver?: Profile;
}

export interface Conversation {
  user: Profile;
  last_message: Message;
  unread_count: number;
}

export const messagesService = {
  async fetchConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log('Fetching conversations for user:', userId);
      
      // Get messages where the user is either the sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!messages || messages.length === 0) return [];
      
      // Process messages to get unique conversations
      const conversationsMap = new Map<string, Conversation>();
      
      messages.forEach((message: any) => {
        // Determine if the other user in this conversation is the sender or receiver
        const otherUser = message.sender_id === userId ? message.receiver : message.sender;
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        
        if (!otherUserId || !otherUser) return;
        
        // If we haven't seen this conversation yet, or this message is newer
        if (!conversationsMap.has(otherUserId) || 
            new Date(conversationsMap.get(otherUserId)!.last_message.created_at) < new Date(message.created_at)) {
          
          // Count unread messages where the user is the receiver
          const unreadCount = messages.filter(
            (m: any) => m.receiver_id === userId && 
                       m.sender_id === otherUserId && 
                       !m.is_read
          ).length;
          
          conversationsMap.set(otherUserId, {
            user: otherUser,
            last_message: message,
            unread_count: unreadCount
          });
        }
      });
      
      // Convert map to array
      return Array.from(conversationsMap.values());
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load conversations',
        description: error.message || 'An unknown error occurred',
      });
      return [];
    }
  },
  
  async fetchMessages(userId: string, otherUserId: string): Promise<Message[]> {
    try {
      console.log(`Fetching messages between ${userId} and ${otherUserId}`);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Mark messages as read where current user is the receiver
      const unreadMessages = data?.filter(msg => msg.receiver_id === userId && !msg.is_read) || [];
      if (unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(msg => msg.id));
          
        if (updateError) console.error('Error marking messages as read:', updateError);
      }
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load messages',
        description: error.message || 'An unknown error occurred',
      });
      return [];
    }
  },
  
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message | null> {
    try {
      if (!content.trim()) throw new Error('Message cannot be empty');
      
      console.log(`Sending message from ${senderId} to ${receiverId}: ${content}`);
      
      // Check if sender follows receiver
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select()
        .eq('follower_id', senderId)
        .eq('followed_id', receiverId)
        .single();
      
      if (followsError && followsError.code !== 'PGRST116') {
        throw new Error('Error checking follow status');
      }
      
      if (!follows) {
        throw new Error('You can only send messages to users you follow');
      }
      
      // Create a new message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: content.trim(),
          is_read: false
        })
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .single();
      
      if (error) throw error;
      
      return data || null;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to send message',
        description: error.message || 'An unknown error occurred',
      });
      return null;
    }
  }
};
