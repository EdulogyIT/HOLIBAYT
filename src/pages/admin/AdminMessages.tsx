import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  user_id: string;
  admin_id: string | null;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  conversation_type: string;
  property_id: string | null;
  recipient_id: string | null;
  profiles?: {
    name: string;
    email: string;
  };
  properties?: {
    id: string;
    title: string;
  } | null;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: string;
}

export default function AdminMessages() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      // Fetch all conversations with property details
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          properties:property_id (
            id,
            title
          )
        `)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // Fetch profiles for each conversation
      if (convData && convData.length > 0) {
        const userIds = [...new Set(convData.map(c => c.user_id))];
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);

        if (profileError) throw profileError;

        // Merge profiles into conversations
        const enrichedConvs = convData.map(conv => ({
          ...conv,
          profiles: profileData?.find(p => p.id === conv.user_id) || { name: 'Unknown', email: '' }
        }));

        setConversations(enrichedConvs);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

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
      toast.error("Failed to load messages");
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: replyText,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      // Update conversation timestamp and admin
      const { error: convError } = await supabase
        .from('conversations')
        .update({ 
          admin_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);

      if (convError) throw convError;

      toast.success("Reply sent successfully");
      setReplyText("");
      fetchMessages(selectedConversation.id);
      fetchConversations();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (conversationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: newStatus })
        .eq('id', conversationId);

      if (error) throw error;
      
      toast.success(`Status updated to ${newStatus}`);
      fetchConversations();
      
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation({ ...selectedConversation, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.messages')}</h1>
          <p className="text-muted-foreground">
            Manage user conversations and support requests
          </p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{conversations.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {conversations.filter(c => c.status === 'active').length}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedConversation?.id === conv.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">
                            {conv.profiles?.name || 'Unknown User'}
                          </p>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(conv.status)}`}>
                            {conv.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-1">
                          {conv.conversation_type === 'property_inquiry' && conv.properties
                            ? `Property: ${conv.properties.title}`
                            : conv.conversation_type === 'host_to_host'
                            ? 'Host-to-Host Conversation'
                            : conv.subject}
                        </p>
                        {conv.conversation_type && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {conv.conversation_type === 'property_inquiry' 
                              ? 'Property Inquiry' 
                              : conv.conversation_type === 'host_to_host'
                              ? 'Host Chat'
                              : 'Support'}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConversation.profiles?.name || 'Unknown User'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedConversation.subject}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selectedConversation.id, 'active')}
                      disabled={selectedConversation.status === 'active'}
                    >
                      Mark Active
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selectedConversation.id, 'closed')}
                      disabled={selectedConversation.status === 'closed'}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                  />
                  <Button
                    onClick={sendReply}
                    disabled={!replyText.trim() || sending}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
