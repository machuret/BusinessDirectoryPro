import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PageContent, Business } from "@shared/schema";

export default function GetFeaturedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [message, setMessage] = useState("");

  // Fetch page content
  const { data: pageContent, isLoading: contentLoading } = useQuery<PageContent>({
    queryKey: ["/api/page-content/get-featured"],
  });

  // Fetch user's businesses
  const { data: businesses = [], isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/user/businesses"],
    enabled: !!user,
  });

  // Fetch user's existing featured requests
  const { data: existingRequests = [], isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ["/api/featured-requests/user"],
    enabled: !!user,
  });

  // Submit featured request mutation
  const submitRequestMutation = useMutation({
    mutationFn: async (data: { businessId: string; message?: string }) => {
      const response = await apiRequest("POST", "/api/featured-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your featured request has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/featured-requests/user"] });
      setSelectedBusinessId("");
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedBusinessId) {
      toast({
        title: "Business Required",
        description: "Please select a business to submit for featuring.",
        variant: "destructive",
      });
      return;
    }

    submitRequestMutation.mutate({
      businessId: selectedBusinessId,
      message: message.trim() || undefined,
    });
  };

  // Check if user has businesses
  const hasBusinesses = businesses.length > 0;

  // Get available businesses (not already requested)
  const requestedBusinessIds = new Set(existingRequests.map((req: any) => req.businessId) || []);
  const availableBusinesses = businesses.filter(business => !requestedBusinessIds.has(business.placeid));

  if (contentLoading || businessesLoading || requestsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!hasBusinesses) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Get Featured
            </CardTitle>
            <CardDescription>
              You need to own at least one business to submit a featured request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Businesses Found</h3>
              <p className="text-muted-foreground mb-4">
                You need to claim ownership of a business before you can submit it for featuring.
              </p>
              <Button onClick={() => window.location.href = "/dashboard"}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid gap-6">
        {/* Page Header with Dynamic Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {pageContent?.title || "Get Featured"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: pageContent?.content?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') || "Loading content..." }} />
            </div>
          </CardContent>
        </Card>

        {/* Existing Requests Status */}
        {existingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Featured Requests</CardTitle>
              <CardDescription>Track the status of your submitted requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {existingRequests.map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{request.businessTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      {request.message && (
                        <p className="text-sm text-muted-foreground mt-1">"{request.message}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {request.status === 'rejected' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit New Request */}
        {availableBusinesses.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Submit New Request</CardTitle>
              <CardDescription>Select a business to submit for featuring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-select">Select Business</Label>
                <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a business to feature" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBusinesses.map((business) => (
                      <SelectItem key={business.placeid} value={business.placeid}>
                        <div className="flex flex-col">
                          <span>{business.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {business.city}, {business.state}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Additional Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us why your business should be featured..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!selectedBusinessId || submitRequestMutation.isPending}
                className="w-full"
              >
                {submitRequestMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Submit Featured Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">All Businesses Submitted</h3>
              <p className="text-muted-foreground">
                You have already submitted featured requests for all your businesses.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}