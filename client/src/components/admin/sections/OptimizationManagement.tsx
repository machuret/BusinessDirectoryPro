import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Sparkles, FileText, Search } from "lucide-react";

interface Business {
  placeid: string;
  businessname?: string;
  title?: string;
  name?: string;
  city?: string;
  category?: { name: string };
}

export function OptimizationManagement() {
  const { toast } = useToast();
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [showFaqDialog, setShowFaqDialog] = useState(false);

  const { data: businesses, isLoading } = useQuery<Business[]>({
    queryKey: ["/api/admin/businesses"],
  });

  const optimizeDescriptionsMutation = useMutation({
    mutationFn: async (businessIds: string[]) => {
      const res = await apiRequest("POST", "/api/admin/optimize-businesses", {
        businessIds,
        type: "descriptions"
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ 
        title: "Success", 
        description: `Optimized descriptions for ${data.success} businesses` 
      });
      setSelectedBusinesses([]);
      setShowDescriptionDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const generateFaqsMutation = useMutation({
    mutationFn: async (businessIds: string[]) => {
      const res = await apiRequest("POST", "/api/admin/optimize-businesses", {
        businessIds,
        type: "faqs"
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ 
        title: "Success", 
        description: `Generated FAQs for ${data.success} businesses` 
      });
      setSelectedBusinesses([]);
      setShowFaqDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredBusinesses = businesses?.filter(business => {
    const businessName = business.businessname || business.title || business.name || "";
    const cityName = business.city || "";
    const categoryName = business.category?.name || "";
    
    return businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           categoryName.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleSelectAll = () => {
    if (selectedBusinesses.length === filteredBusinesses.length) {
      setSelectedBusinesses([]);
    } else {
      setSelectedBusinesses(filteredBusinesses.map(business => business.placeid));
    }
  };

  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusinesses(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  const handleOptimizeDescriptions = () => {
    if (selectedBusinesses.length === 0) {
      toast({ title: "Error", description: "Please select at least one business", variant: "destructive" });
      return;
    }
    setShowDescriptionDialog(true);
  };

  const handleGenerateFaqs = () => {
    if (selectedBusinesses.length === 0) {
      toast({ title: "Error", description: "Please select at least one business", variant: "destructive" });
      return;
    }
    setShowFaqDialog(true);
  };

  const confirmOptimizeDescriptions = () => {
    optimizeDescriptionsMutation.mutate(selectedBusinesses);
  };

  const confirmGenerateFaqs = () => {
    generateFaqsMutation.mutate(selectedBusinesses);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Content Optimization</CardTitle>
          <CardDescription>Use AI to optimize business descriptions and generate FAQs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Select Businesses for Optimization</h3>
                <Badge variant="outline">{selectedBusinesses.length} selected</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleOptimizeDescriptions}
                  disabled={selectedBusinesses.length === 0 || optimizeDescriptionsMutation.isPending}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Optimize Descriptions ({selectedBusinesses.length})
                </Button>
                <Button 
                  onClick={handleGenerateFaqs}
                  disabled={selectedBusinesses.length === 0 || generateFaqsMutation.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate FAQs ({selectedBusinesses.length})
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedBusinesses.length === filteredBusinesses.length && filteredBusinesses.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>City</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => (
                    <TableRow key={business.placeid}>
                      <TableCell>
                        <Checkbox
                          checked={selectedBusinesses.includes(business.placeid)}
                          onCheckedChange={() => handleSelectBusiness(business.placeid)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{business.businessname || business.title || business.name || "Unnamed Business"}</TableCell>
                      <TableCell>{business.category?.name || 'N/A'}</TableCell>
                      <TableCell>{business.city}</TableCell>
                    </TableRow>
                  ))}
                  {filteredBusinesses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {searchTerm ? "No businesses match your search." : "No businesses found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optimize Descriptions Confirmation Dialog */}
      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Optimize Business Descriptions</DialogTitle>
            <DialogDescription>
              This will use AI to optimize descriptions for {selectedBusinesses.length} selected businesses. 
              This action will overwrite existing descriptions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDescriptionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmOptimizeDescriptions}
              disabled={optimizeDescriptionsMutation.isPending}
            >
              {optimizeDescriptionsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Optimize Descriptions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate FAQs Confirmation Dialog */}
      <Dialog open={showFaqDialog} onOpenChange={setShowFaqDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Business FAQs</DialogTitle>
            <DialogDescription>
              This will use AI to generate FAQs for {selectedBusinesses.length} selected businesses. 
              This action will overwrite existing FAQs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFaqDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmGenerateFaqs}
              disabled={generateFaqsMutation.isPending}
            >
              {generateFaqsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generate FAQs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default export for backward compatibility
export default OptimizationManagement;