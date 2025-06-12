import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  businessId?: string;
  businessName?: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: Date;
  location?: string;
}

export default function InboxManagement() {
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ['/api/admin/contact-messages'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/contact-messages/${id}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark message as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-messages'] });
      toast({ title: "Message marked as read" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete message');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-messages'] });
      toast({ title: "Message deleted" });
      setSelectedMessage(null);
    },
  });

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      markAsReadMutation.mutate(message.id);
    }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (isLoading) {
    return <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Messages</h2>
          <p className="text-muted-foreground">
            Manage customer inquiries and leads ({unreadCount} unread)
          </p>
        </div>
        <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
          {messages.length} total messages
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No messages yet
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedMessage?.id === message.id ? 'bg-muted' : ''
                  } ${
                    message.status === 'unread' ? 'border-blue-200 bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleViewMessage(message)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{message.name}</h4>
                        {message.status === 'unread' && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {message.subject}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Message Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Message Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{selectedMessage.subject}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <strong>From:</strong> {selectedMessage.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedMessage.email}
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedMessage.phone}
                      </div>
                    )}
                    {selectedMessage.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedMessage.location}
                      </div>
                    )}
                    {selectedMessage.businessName && (
                      <div className="flex items-center gap-2">
                        <strong>Business:</strong> {selectedMessage.businessName}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(new Date(selectedMessage.createdAt), 'MMMM d, yyyy at h:mm a')}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Message:</h4>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(selectedMessage.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a message to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}