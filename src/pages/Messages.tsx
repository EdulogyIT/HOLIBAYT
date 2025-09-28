import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Plus, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Conversation {
  id: string;
  subject: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  admin_id: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: string;
}

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      
      setNewMessage("");
      await fetchMessages(selectedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Start new conversation
  const startNewConversation = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          subject: "Property Inquiry"
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchConversations();
      setSelectedConversation(data.id);
      
      toast({
        title: "Success",
        description: "New conversation started with our support team"
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start new conversation",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();
      
      // Auto-create conversation if coming from "Start Chat" and no conversations exist
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('start') === 'true') {
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Check if user has any conversations, if not create one
        setTimeout(async () => {
          const { data } = await supabase
            .from('conversations')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);
          
          if (!data || data.length === 0) {
            startNewConversation();
          }
        }, 1000);
      }
    }
    setLoading(false);
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="text-center py-12">
              <CardContent>
                <h1 className="text-2xl font-bold mb-4">Please log in to view your messages</h1>
                <p className="text-muted-foreground mb-4">
                  You need to be signed in to access your conversations.
                </p>
                <Button onClick={() => window.location.href = '/login'}>
                  Log In
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 font-playfair">Messages</h1>
            <p className="text-lg text-muted-foreground font-inter">
              Chat with our support team and property advisors
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversations
                </CardTitle>
                <Button onClick={startNewConversation} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No conversations yet</p>
                      <Button onClick={startNewConversation} variant="outline" size="sm" className="mt-2">
                        Start your first conversation
                      </Button>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedConversation === conversation.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="font-medium">{conversation.subject || 'General Inquiry'}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(conversation.updated_at), 'MMM dd, HH:mm')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Status: {conversation.status}
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedConversation 
                    ? conversations.find(c => c.id === selectedConversation)?.subject || 'General Inquiry'
                    : 'Select a conversation'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedConversation ? (
                  <div className="flex flex-col h-[500px]">
                    <ScrollArea className="flex-1 p-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[70%] p-3 rounded-lg ${
                                  message.sender_id === user?.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                {message.sender_id !== user?.id && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="h-3 w-3" />
                                    <span className="text-xs font-medium">
                                      Support Team
                                    </span>
                                  </div>
                                )}
                                <div className="text-sm">{message.content}</div>
                                <div
                                  className={`text-xs mt-1 ${
                                    message.sender_id === user?.id
                                      ? 'text-primary-foreground/70'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {format(new Date(message.created_at), 'HH:mm')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    
                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          disabled={sendingMessage}
                        />
                        <Button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start chatting</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;