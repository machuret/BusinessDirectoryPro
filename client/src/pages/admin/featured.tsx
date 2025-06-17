import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function AdminFeaturedPage() {
  const queryClient = useQueryClient();

  const { data: featuredRequests, isLoading } = useQuery({
    queryKey: ['/api/admin/featured-requests'],
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) =>
      fetch(`/api/admin/featured-requests/${requestId}/approve`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-requests'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      fetch(`/api/admin/featured-requests/${requestId}/reject`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-requests'] });
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading featured requests...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Featured Business Requests</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {featuredRequests?.filter((r: any) => r.status === 'pending').length || 0} Pending
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {featuredRequests?.map((request: any) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    {request.businessName}
                  </CardTitle>
                  <p className="text-gray-600">{request.category} • {request.city}</p>
                </div>
                <Badge 
                  variant={
                    request.status === 'approved' ? 'default' : 
                    request.status === 'rejected' ? 'destructive' : 
                    'secondary'
                  }
                >
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Business Owner</p>
                  <p>{request.ownerName}</p>
                  <p>{request.ownerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested On</p>
                  <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {request.reason && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Reason for Featuring</p>
                  <p className="text-sm">{request.reason}</p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => approveMutation.mutate(request.id)}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Feature
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => rejectMutation.mutate(request.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Business
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )) || (
          <Card>
            <CardContent className="text-center py-8">
              <Star className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No featured requests found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}