import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, CheckCircle, Eye, XCircle, Clock, Building2, User, Mail, Phone, MapPin, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BusinessSubmission {
  id: number;
  title: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  categoryName?: string;
  submittedBy: string;
  submitterEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  adminNotes?: string;
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export default function SubmissionsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<BusinessSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const { toast } = useToast();

  // Fetch business submissions
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['/api/admin/business-submissions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/business-submissions');
      return response.json();
    },
  });

  // Update submission status mutation
  const updateSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, status, notes }: { submissionId: number; status: string; notes: string }) => {
      const response = await apiRequest('PUT', `/api/admin/business-submissions/${submissionId}`, {
        status,
        adminNotes: notes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/business-submissions'] });
      setSelectedSubmission(null);
      setReviewNotes("");
      toast({
        title: "Submission Updated",
        description: "Business submission status has been updated successfully",
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

  const handleApprove = () => {
    if (selectedSubmission) {
      updateSubmissionMutation.mutate({
        submissionId: selectedSubmission.id,
        status: 'approved',
        notes: reviewNotes,
      });
    }
  };

  const handleReject = () => {
    if (selectedSubmission) {
      updateSubmissionMutation.mutate({
        submissionId: selectedSubmission.id,
        status: 'rejected',
        notes: reviewNotes,
      });
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission: BusinessSubmission) => {
    const matchesSearch = submission.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.submitterEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Submissions</h2>
          <p className="text-muted-foreground">Review and manage new business listings submitted by users</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {submissions.length} total submissions
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search & Filter Submissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by business name, city, or submitter email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Business Submissions</CardTitle>
          <CardDescription>
            {filteredSubmissions.length} submissions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Business Submissions Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "No submissions match your current filters"
                  : "No business submissions have been submitted yet"
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission: BusinessSubmission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{submission.title}</div>
                          <div className="text-sm text-muted-foreground">{submission.categoryName || 'No category'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm">{submission.city || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{submission.address}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{submission.contactInfo?.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{submission.submitterEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(submission.submissionDate), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Business Submission</DialogTitle>
                            <DialogDescription>
                              Review the details and make a decision on this business submission
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedSubmission && (
                            <div className="space-y-6">
                              {/* Business Info */}
                              <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  Business Information
                                </h4>
                                <div className="bg-muted p-3 rounded-lg space-y-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Name:</span> {selectedSubmission.title}
                                    </div>
                                    <div>
                                      <span className="font-medium">Category:</span> {selectedSubmission.categoryName || 'Not specified'}
                                    </div>
                                  </div>
                                  {selectedSubmission.description && (
                                    <div className="text-sm">
                                      <span className="font-medium">Description:</span>
                                      <p className="mt-1 text-muted-foreground">{selectedSubmission.description}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Contact Info */}
                              <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  Contact Information
                                </h4>
                                <div className="bg-muted p-3 rounded-lg">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    {selectedSubmission.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        <span className="font-medium">Phone:</span> {selectedSubmission.phone}
                                      </div>
                                    )}
                                    {selectedSubmission.email && (
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        <span className="font-medium">Email:</span> {selectedSubmission.email}
                                      </div>
                                    )}
                                    {selectedSubmission.website && (
                                      <div className="flex items-center gap-2">
                                        <Globe className="h-3 w-3" />
                                        <span className="font-medium">Website:</span> {selectedSubmission.website}
                                      </div>
                                    )}
                                    {selectedSubmission.address && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3" />
                                        <span className="font-medium">Address:</span> {selectedSubmission.address}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Submitter Info */}
                              <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Submitter Information
                                </h4>
                                <div className="bg-muted p-3 rounded-lg">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <User className="h-3 w-3" />
                                      <span className="font-medium">Name:</span> {selectedSubmission.contactInfo?.name || 'Not provided'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      <span className="font-medium">Email:</span> {selectedSubmission.submitterEmail}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Admin Review */}
                              <div className="space-y-2">
                                <h4 className="font-semibold">Admin Review</h4>
                                <Textarea
                                  placeholder="Add notes about your decision..."
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              {/* Actions */}
                              {selectedSubmission.status === 'pending' && (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={handleReject}
                                    disabled={updateSubmissionMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={handleApprove}
                                    disabled={updateSubmissionMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve & Create Listing
                                  </Button>
                                </div>
                              )}

                              {selectedSubmission.status !== 'pending' && (
                                <div className="bg-muted p-3 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(selectedSubmission.status)}
                                    <span className="text-sm text-muted-foreground">
                                      on {new Date(selectedSubmission.submissionDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {selectedSubmission.adminNotes && (
                                    <div className="mt-2 text-sm">
                                      <span className="font-medium">Admin Notes:</span> {selectedSubmission.adminNotes}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}