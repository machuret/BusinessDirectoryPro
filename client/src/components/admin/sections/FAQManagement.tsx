import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit } from "lucide-react";

export default function FAQManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>FAQ Management</CardTitle>
          <CardDescription>Manage frequently asked questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Website FAQs</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 border rounded">
                <div>
                  <h4 className="font-semibold">How do I claim my business?</h4>
                  <p className="text-sm text-muted-foreground">Instructions for business owners to claim their listings</p>
                  <div className="text-xs text-muted-foreground mt-1">Category: Business Owners</div>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="default">Published</Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 border rounded">
                <div>
                  <h4 className="font-semibold">How do I leave a review?</h4>
                  <p className="text-sm text-muted-foreground">Guide for customers to submit reviews</p>
                  <div className="text-xs text-muted-foreground mt-1">Category: Customers</div>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="default">Published</Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}