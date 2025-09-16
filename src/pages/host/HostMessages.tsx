import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Building2,
  Clock,
  User,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ContactRequest {
  id: string;
  property_id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  // Property details from join
  property_title?: string;
  property_city?: string;
}

export default function HostMessages() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactRequest | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      // Fetch contact requests for properties owned by this host
      const { data, error } = await supabase
        .from('contact_requests')
        .select(`
          *,
          properties!inner(title, city)
        `)
        .eq('properties.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        // Flatten the data structure
        const formattedMessages = data?.map(item => ({
          ...item,
          property_title: item.properties?.title,
          property_city: item.properties?.city
        })) || [];
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (error) {
        console.error('Error updating message status:', error);
      } else {
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: newStatus } : msg
        ));
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t('host.newStatus');
      case 'read': return t('host.readStatus');
      case 'replied': return t('host.repliedStatus');
      case 'archived': return t('host.archivedStatus');
      default: return status;
    }
  };

  const openChatModal = (message: ContactRequest) => {
    setSelectedMessage(message);
    setReplyText('');
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    // Here you would typically send the reply to your backend
    // For now, we'll just update the status to replied
    await updateMessageStatus(selectedMessage.id, 'replied');
    setSelectedMessage(null);
    setReplyText('');
  };

  const pendingCount = messages.filter(m => m.status === 'pending').length;
  const totalCount = messages.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t('host.loadingMessages')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('host.messagesPage')}</h1>
        <p className="text-muted-foreground">
          {t('host.manageContactRequests')}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('host.unreadMessages')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('host.totalMessages')}</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('host.responseRate')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCount > 0 ? Math.round((messages.filter(m => m.status === 'replied').length / totalCount) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={`${message.status === 'pending' ? 'border-l-4 border-l-yellow-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{message.subject}</h3>
                      <Badge className={getStatusColor(message.status)}>
                        {getStatusLabel(message.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {message.requester_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {message.property_title} - {message.property_city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{message.message}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {message.requester_email}
                      </div>
                      {message.requester_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {message.requester_phone}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {message.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateMessageStatus(message.id, 'read')}
                        >
                          {t('host.markAsRead')}
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        onClick={() => openChatModal(message)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {t('host.reply')}
                      </Button>
                      {message.requester_phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `tel:${message.requester_phone}`}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          {t('host.call')}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateMessageStatus(message.id, 'archived')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {t('host.archive')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('host.noMessages')}</h3>
            <p className="text-muted-foreground">
              {t('host.noContactRequests')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Chat Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('host.reply')} - {selectedMessage?.requester_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">{selectedMessage?.subject}</p>
              <p className="text-sm text-muted-foreground">{selectedMessage?.message}</p>
            </div>
            
            <Textarea
              placeholder={`${t('host.reply')}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                {t('cancel')}
              </Button>
              <Button onClick={sendReply} disabled={!replyText.trim()}>
                {t('host.reply')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}