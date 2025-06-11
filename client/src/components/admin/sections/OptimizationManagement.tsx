import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, HelpCircle } from "lucide-react";

export default function OptimizationManagement() {
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
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <div className="text-sm text-muted-foreground">Total Businesses</div>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-green-600">892</div>
                <div className="text-sm text-muted-foreground">AI Optimized</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Optimization Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <Edit className="h-6 w-6 mb-2" />
                  <div className="text-center">
                    <div className="font-medium">Optimize Descriptions</div>
                    <div className="text-xs text-muted-foreground">Enhance business descriptions with AI</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <HelpCircle className="h-6 w-6 mb-2" />
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