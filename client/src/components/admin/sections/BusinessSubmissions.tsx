import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, Check, X, Clock, Building, MapPin, Phone, Globe, Mail, Calendar, Tag, User, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface BusinessSubmission {
  placeid: string;
  title: string;
  description: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  categoryid: number;
  categoryname?: string;
  status: string;
  submittedby: string;
  createdat: Date;
  updatedat?: Date;
  submitterName?: string;
  submitterEmail?: string;
}

interface ApprovalDialogProps {
  submission: BusinessSubmission;
  action: 'approve' | 'reject';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ApprovalDialog({ submission, action, open, onOpenChange, onSuccess }: ApprovalDialogProps) {
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const approveMutation = useMutation({
    mutationFn: async ({ submissionId, status, adminNotes }: { submissionId: string; status: string; adminNotes?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/business-submissions/${submissionId}`, {
        status,
        adminNotes
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update submission");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/business-submissions"] });
      toast({
        title: action === 'approve' ? "Business Approved" : "Business Rejected",
        description: `${submission.title} has been ${action === 'approve' ? 'approved and published' : 'rejected'}.`
      });
      onSuccess();
      onOpenChange(false);
      setNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    approveMutation.mutate({
      submissionId: submission.placeid,
      status: action === 'approve' ? 'approved' : 'rejected',
      adminNotes: notes
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'approve' ? 'Approve' : 'Reject'} Business Submission
          </DialogTitle>
          <DialogDescription>
            {action === 'approve' 
              ? `Approve "${submission.title}" to publish it to the directory.`
              : `Reject "${submission.title}" and provide feedback to the submitter.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Admin Notes {action === 'reject' ? '(Required)' : '(Optional)'}</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={action === 'approve' 
                ? "Add any internal notes about this approval..."
                : "Explain why this submission is being rejected..."
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={approveMutation.isPending || (action === 'reject' && !notes.trim())}
            variant={action === 'approve' ? 'default' : 'destructive'}
          >
            {approveMutation.isPending ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Reject')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BusinessDetailsDialogProps {
  submission: BusinessSubmission;
  isOpen: boolean;
  onClose: () => void;
}

function BusinessDetailsDialog({ submission, isOpen, onClose }: BusinessDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {submission.title}
          </DialogTitle>
          <DialogDescription>
            Business submission details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Submission Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={
                  submission.status === 'pending' ? 'secondary' :
                  submission.status === 'approved' ? 'default' : 'destructive'
                }>
                  {submission.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Submitted</label>
              <p className="mt-1">{format(new Date(submission.createdat), 'MMM d, yyyy')}</p>
            </div>
          </div>

          {/* Submitter Info */}
          <div>
            <label className="text-sm font-medium text-gray-500">Submitted By</label>
            <div className="mt-1 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{submission.submitterName || 'Unknown User'}</span>
              {submission.submitterEmail && (
                <span className="text-gray-500">({submission.submitterEmail})</span>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="font-medium mb-3">Business Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Business Name</label>
                <p className="mt-1">{submission.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-700">{submission.description}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <div className="mt-1 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span>{submission.categoryname || 'Unknown Category'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-medium mb-3">Location</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p>{submission.address}</p>
                  <p className="text-gray-600">{submission.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-medium mb-3">Contact Information</h3>
            <div className="space-y-2">
              {submission.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{submission.phone}</span>
                </div>
              )}
              
              {submission.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{submission.email}</span>
                </div>
              )}
              
              {submission.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {submission.website}
                  </a>
                </div>
              )}
              
              {submission.hours && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Hours</label>
                    <p className="whitespace-pre-line">{submission.hours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BusinessSubmissions() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<BusinessSubmission | null>(null);
  const [approvalDialog, setApprovalDialog] = useState<{ submission: BusinessSubmission; action: 'approve' | 'reject' } | null>(null);
  const [detailsDialog, setDetailsDialog] = useState<BusinessSubmission | null>(null);

  const { data: submissions, isLoading } = useQuery<BusinessSubmission[]>({
    queryKey: ["/api/admin/business-submissions"],
  });

  const filteredSubmissions = submissions?.filter(submission => {
    if (statusFilter === "all") return true;
    return submission.status === statusFilter;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = submissions?.filter(s => s.status === 'pending').length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p>Loading business submissions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Submissions</h2>
          <p className="text-gray-600">Review and approve business listings submitted by users</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {pendingCount} pending approval
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No business submissions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.placeid}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{submission.title}</h3>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{submission.address}, {submission.city}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span>{submission.categoryname || 'Unknown Category'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Submitted by {submission.submitterName || 'Unknown User'}</span>
                        <span>•</span>
                        <span>{format(new Date(submission.createdat), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-gray-700 line-clamp-2">{submission.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailsDialog(submission)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    {submission.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setApprovalDialog({ submission, action: 'approve' })}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setApprovalDialog({ submission, action: 'reject' })}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      {approvalDialog && (
        <ApprovalDialog
          submission={approvalDialog.submission}
          action={approvalDialog.action}
          isOpen={true}
          onClose={() => setApprovalDialog(null)}
          onSuccess={() => setApprovalDialog(null)}
        />
      )}

      {detailsDialog && (
        <BusinessDetailsDialog
          submission={detailsDialog}
          isOpen={true}
          onClose={() => setDetailsDialog(null)}
        />
      )}
    </div>
  );
}