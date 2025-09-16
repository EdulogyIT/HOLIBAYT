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
import { supabase } from '@/integrations/supabase/client';

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
  const [messages, setMessages] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
      case 'pending': return 'Nouveau';
      case 'read': return 'Lu';
      case 'replied': return 'Répondu';
      case 'archived': return 'Archivé';
      default: return status;
    }
  };

  const pendingCount = messages.filter(m => m.status === 'pending').length;
  const totalCount = messages.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Gérez les demandes de contact pour vos propriétés
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages non lus</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de réponse</CardTitle>
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
                          Marquer comme lu
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        onClick={() => window.location.href = `mailto:${message.requester_email}?subject=Re: ${message.subject}`}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Répondre
                      </Button>
                      {message.requester_phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `tel:${message.requester_phone}`}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Appeler
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateMessageStatus(message.id, 'archived')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Archiver
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
            <h3 className="text-lg font-semibold mb-2">Aucun message</h3>
            <p className="text-muted-foreground">
              Vous n'avez reçu aucune demande de contact pour le moment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}