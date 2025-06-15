import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { useContent } from "@/contexts/ContentContext";

interface FeaturedRequest {
  id: number;
  businessId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  adminMessage?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  businessTitle?: string;
  businessCity?: string;
}

interface Business {
  placeid: string;
  title: string | null;
  city?: string | null;
  featured: boolean;
}

interface FeaturedRequestsSectionProps {
  userId: string;
  userBusinesses: Business[];
}

export function FeaturedRequestsSection({ userId, userBusinesses }: FeaturedRequestsSectionProps) {
  const { t } = useContent();
  const { toast } = useToast();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [message, setMessage] = useState("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  // Fetch user's featured requests
  const { data: featuredRequests = [], isLoading } = useQuery({
    queryKey: ['/api/featured-requests/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/featured-requests/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch featured requests');
      return response.json();
    }
  });

  // Create featured request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: { businessId: string; message?: string }) => {
      const response = await apiRequest('POST', '/api/featured-requests', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/featured-requests/user', userId] });
      setShowRequestDialog(false);
      setSelectedBusiness(null);
      setMessage("");
      toast({
        title: t("dashboard.featured.request.success.title"),
        description: t("dashboard.featured.request.success.description"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("dashboard.featured.request.error.title"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{t("dashboard.featured.status.pending")}</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />{t("dashboard.featured.status.approved")}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />{t("dashboard.featured.status.rejected")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const eligibleBusinesses = userBusinesses.filter(business => 
    !business.featured && 
    !featuredRequests.some((req: any) => req.businessId === business.placeid && req.status === 'pending')
  );

  const handleSubmitRequest = () => {
    if (!selectedBusiness) return;
    
    createRequestMutation.mutate({
      businessId: selectedBusiness.placeid,
      message: message.trim() || undefined
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {t("dashboard.featured.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          {t("dashboard.featured.title")}
        </CardTitle>
        <CardDescription>
          {t("dashboard.featured.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Request New Featured Status */}
        {eligibleBusinesses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("dashboard.featured.request.title")}</h3>
              <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("dashboard.featured.request.new")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("dashboard.featured.request.title")}</DialogTitle>
                    <DialogDescription>
                      {t("dashboard.featured.request.description")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business">{t("dashboard.featured.form.business")}</Label>
                      <select
                        id="business"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedBusiness?.placeid || ''}
                        onChange={(e) => {
                          const business = eligibleBusinesses.find(b => b.placeid === e.target.value);
                          setSelectedBusiness(business || null);
                        }}
                      >
                        <option value="">{t("dashboard.featured.form.choose")}</option>
                        {eligibleBusinesses.map((business) => (
                          <option key={business.placeid} value={business.placeid}>
                            {business.title} {business.city && `- ${business.city}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t("dashboard.featured.form.message")}</Label>
                      <Textarea
                        id="message"
                        placeholder={t("dashboard.featured.form.placeholder")}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRequestDialog(false);
                          setSelectedBusiness(null);
                          setMessage("");
                        }}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        onClick={handleSubmitRequest}
                        disabled={!selectedBusiness || createRequestMutation.isPending}
                      >
                        {createRequestMutation.isPending ? t("dashboard.featured.form.submitting") : t("dashboard.featured.form.submit")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-gray-600">
              {t("dashboard.featured.eligible", { count: eligibleBusinesses.length })}
            </p>
          </div>
        )}

        {/* No Eligible Businesses */}
        {eligibleBusinesses.length === 0 && userBusinesses.length > 0 && (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("dashboard.featured.empty.noeligible.title")}</h3>
            <p className="text-gray-600">
              {t("dashboard.featured.empty.noeligible.description")}
            </p>
          </div>
        )}

        {/* No Businesses */}
        {userBusinesses.length === 0 && (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("dashboard.featured.empty.nobusinesses.title")}</h3>
            <p className="text-gray-600">
              {t("dashboard.featured.empty.nobusinesses.description")}
            </p>
          </div>
        )}

        {/* Existing Featured Requests */}
        {featuredRequests.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("dashboard.featured.requests.title")}</h3>
            <div className="space-y-4">
              {featuredRequests.map((request: FeaturedRequest) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {request.businessTitle || 'Business'}
                          </h4>
                          {getStatusBadge(request.status)}
                        </div>
                        {request.businessCity && (
                          <p className="text-sm text-gray-600">{request.businessCity}</p>
                        )}
                        {request.message && (
                          <p className="text-sm text-gray-700">
                            <strong>Your message:</strong> {request.message}
                          </p>
                        )}
                        {request.adminMessage && (
                          <p className="text-sm text-gray-700">
                            <strong>Admin response:</strong> {request.adminMessage}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>Submitted {format(new Date(request.createdAt), 'MMM d, yyyy')}</p>
                        {request.reviewedAt && (
                          <p>Reviewed {format(new Date(request.reviewedAt), 'MMM d, yyyy')}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Requests */}
        {featuredRequests.length === 0 && eligibleBusinesses.length > 0 && (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Requests</h3>
            <p className="text-gray-600 mb-4">
              You haven't submitted any featured requests yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}