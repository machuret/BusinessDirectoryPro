import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

export default function AdminSubmissionsPage() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['/api/admin/submissions'],
    queryFn: () => fetch('/api/admin/submissions').then(res => res.json())
  });

  const handleApprove = async (submissionId: string) => {
    await fetch(`/api/admin/submissions/${submissionId}/approve`, {
      method: 'POST'
    });
  };

  const handleReject = async (submissionId: string) => {
    await fetch(`/api/admin/submissions/${submissionId}/reject`, {
      method: 'POST'
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading submissions...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Business Submissions</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {submissions?.filter((s: any) => s.status === 'pending').length || 0} Pending
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {submissions?.map((submission: any) => (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{submission.businessName}</CardTitle>
                  <p className="text-gray-600">{submission.category} • {submission.city}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      submission.status === 'approved' ? 'default' : 
                      submission.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {submission.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {submission.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {submission.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                    {submission.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p>{submission.contactName}</p>
                  <p>{submission.contactEmail}</p>
                  <p>{submission.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p>{submission.address}</p>
                  <p>{submission.city}, {submission.state}</p>
                </div>
              </div>
              
              {submission.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm">{submission.description}</p>
                </div>
              )}

              {submission.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleApprove(submission.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleReject(submission.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Review Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )) || (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No submissions found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}