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
            
          </div>
        </CardContent>
      </Card>

      {/* Optimize Descriptions Dialog */}
      <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Optimize Business Descriptions</DialogTitle>
            <DialogDescription>
              Select businesses to enhance their descriptions using AI
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto border rounded">
            {allBusinesses && allBusinesses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBusinesses.map((business) => (
                    <TableRow key={business.placeid}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedBusinesses.includes(business.placeid)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBusinesses([...selectedBusinesses, business.placeid]);
                            } else {
                              setSelectedBusinesses(selectedBusinesses.filter(id => id !== business.placeid));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{business.title}</div>
                          <div className="text-sm text-muted-foreground">{business.city}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{business.categoryname}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {business.description ? 
                            (business.description.length > 50 ? 
                              business.description.substring(0, 50) + '...' : 
                              business.description) : 
                            'No description'
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No businesses available
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptimizeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={startOptimization} disabled={isProcessing || selectedBusinesses.length === 0}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Optimize ${selectedBusinesses.length} Businesses`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate FAQs Dialog */}
      <Dialog open={showFaqDialog} onOpenChange={setShowFaqDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generate Business FAQs</DialogTitle>
            <DialogDescription>
              Select businesses to generate frequently asked questions using AI
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto border rounded">
            {allBusinesses && allBusinesses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current FAQs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBusinesses.map((business) => (
                    <TableRow key={business.placeid}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedBusinesses.includes(business.placeid)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBusinesses([...selectedBusinesses, business.placeid]);
                            } else {
                              setSelectedBusinesses(selectedBusinesses.filter(id => id !== business.placeid));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{business.title}</div>
                          <div className="text-sm text-muted-foreground">{business.city}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{business.categoryname}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {business.faq && business.faq.length > 0 ? 
                            `${business.faq.length} FAQs` : 
                            'No FAQs'
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No businesses available
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFaqDialog(false)}>
              Cancel
            </Button>
            <Button onClick={startOptimization} disabled={isProcessing || selectedBusinesses.length === 0}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Generate FAQs for ${selectedBusinesses.length} Businesses`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}