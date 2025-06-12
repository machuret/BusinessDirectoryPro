import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit, HelpCircle, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Business {
  placeid: string;
  title: string;
  categoryname: string;
  city: string;
  description?: string;
  faq?: any[];
}

interface OptimizationJob {
  id: string;
  businessId: string;
  businessTitle: string;
  type: 'description' | 'faq';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  result?: string;
  error?: string;
}

export default function OptimizationManagement() {
  const { toast } = useToast();
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [optimizationType, setOptimizationType] = useState<'description' | 'faq'>('description');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJobs, setCurrentJobs] = useState<OptimizationJob[]>([]);

  const { data: allBusinesses } = useQuery<Business[]>({
    queryKey: ["/api/admin/businesses"],
  });

  const optimizeBusinessesMutation = useMutation({
    mutationFn: async ({ businessIds, type }: { businessIds: string[], type: 'description' | 'faq' }) => {
      const res = await apiRequest("POST", "/api/admin/optimize-businesses", { businessIds, type });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: `Started ${optimizationType} optimization for ${selectedBusinesses.length} businesses` });
      setShowOptimizeDialog(false);
      setShowFaqDialog(false);
      setSelectedBusinesses([]);
      setIsProcessing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsProcessing(false);
    }
  });

  const handleOptimizeDescriptions = () => {
    setOptimizationType('description');
    setShowOptimizeDialog(true);
  };

  const handleGenerateFAQs = () => {
    setOptimizationType('faq');
    setShowFaqDialog(true);
  };

  const startOptimization = () => {
    if (selectedBusinesses.length === 0) {
      toast({ title: "Error", description: "Please select at least one business", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    optimizeBusinessesMutation.mutate({ businessIds: selectedBusinesses, type: optimizationType });
  };

  const totalBusinesses = allBusinesses?.length || 0;
  const optimizedBusinesses = allBusinesses?.filter(b => 
    optimizationType === 'description' ? b.description && b.description.length > 50 : b.faq && b.faq.length > 0
  ).length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Content Optimization</CardTitle>
          <CardDescription>Use AI to enhance business descriptions and generate FAQs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-blue-600">{totalBusinesses}</div>
                <div className="text-sm text-muted-foreground">Total Businesses</div>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-green-600">{optimizedBusinesses}</div>
                <div className="text-sm text-muted-foreground">With Content</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Optimization Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col"
                  onClick={handleOptimizeDescriptions}
                  disabled={isProcessing}
                >
                  {isProcessing && optimizationType === 'description' ? (
                    <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                  ) : (
                    <Edit className="h-6 w-6 mb-2" />
                  )}
                  <div className="text-center">
                    <div className="font-medium">Optimize Descriptions</div>
                    <div className="text-xs text-muted-foreground">Enhance business descriptions with AI</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col"
                  onClick={handleGenerateFAQs}
                  disabled={isProcessing}
                >
                  {isProcessing && optimizationType === 'faq' ? (
                    <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                  ) : (
                    <HelpCircle className="h-6 w-6 mb-2" />
                  )}
                  <div className="text-center">
                    <div className="font-medium">Generate FAQs</div>
                    <div className="text-xs text-muted-foreground">Create FAQs for businesses</div>
                  </div>
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Optimizations</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">Kedron Family Dental</div>
                    <div className="text-sm text-muted-foreground">Description optimized • 2 hours ago</div>
                  </div>
                  <Badge variant="default">Completed</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">Brisbane Eye Centre</div>
                    <div className="text-sm text-muted-foreground">FAQ generated • 4 hours ago</div>
                  </div>
                  <Badge variant="default">Completed</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}