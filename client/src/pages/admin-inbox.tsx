import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Eye, Trash2, MessageSquare, Clock, User } from "lucide-react";
import type { ContactMessage } from "@shared/schema";

export default function AdminInbox() {
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/contact-messages"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/contact-messages/${id}`, { status, adminNotes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      toast({
        title: "Message Updated",
        description: "Message status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/contact-messages/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      setSelectedMessage(null);
      toast({
        title: "Message Deleted",
        description: "Message has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredMessages = messages.filter(message => {
    if (statusFilter === "all") return true;
    return message.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread": return "destructive";
      case "read": return "secondary";
      case "replied": return "default";
      case "archived": return "outline";
      default: return "secondary";
    }
  };

  const handleStatusUpdate = (status: string, adminNotes?: string) => {
    if (selectedMessage) {
      updateStatusMutation.mutate({ 
        id: selectedMessage.id, 
        status, 
        adminNotes 
      });
      setSelectedMessage(prev => prev ? { ...prev, status, adminNotes: adminNotes || null } : null);
    }
  };

  const unreadCount = messages.filter(m => m.status === "unread").length;
  const totalCount = messages.length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-muted-foreground">
            {unreadCount} unread, {totalCount} total messages
          </p>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="replied">Replied</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4">
          {filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No messages</h3>
                <p className="text-muted-foreground">
                  {statusFilter === "all" ? "No messages in your inbox." : `No ${statusFilter} messages.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredMessages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    message.status === "unread" ? "border-primary" : ""
                  } ${selectedMessage?.id === message.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{message.name}</h3>
                          <Badge variant={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{message.email}</p>
                        <p className="font-medium mb-2">{message.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message from {selectedMessage.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">From</Label>
                  <p className="text-sm">{selectedMessage.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedMessage.email}</p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm">{selectedMessage.phone}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={getStatusColor(selectedMessage.status)}>
                    {selectedMessage.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <p className="text-sm font-semibold">{selectedMessage.subject}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Message</Label>
                <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {selectedMessage.adminNotes && (
                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                    {selectedMessage.adminNotes}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                Received: {new Date(selectedMessage.createdAt).toLocaleString()}
              </div>

              <div className="flex gap-2">
                <Select
                  value={selectedMessage.status}
                  onValueChange={(status) => handleStatusUpdate(status)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const mailto = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`;
                    window.open(mailto);
                    handleStatusUpdate("replied");
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Reply
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(selectedMessage.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>

              <div>
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={selectedMessage.adminNotes || ""}
                  onChange={(e) => setSelectedMessage(prev => prev ? { ...prev, adminNotes: e.target.value || null } : null)}
                  placeholder="Add internal notes about this message..."
                  rows={3}
                />
                <Button
                  className="mt-2"
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedMessage.status, selectedMessage.adminNotes || undefined)}
                  disabled={updateStatusMutation.isPending}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}