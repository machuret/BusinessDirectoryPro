import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, CheckCircle, XCircle } from "lucide-react";

export default function ReviewsManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reviews Management</CardTitle>
          <CardDescription>Moderate reviews, approve submissions, and manage feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-green-600">124</div>
                <div className="text-sm text-muted-foreground">Approved Reviews</div>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-yellow-600">7</div>
                <div className="text-sm text-muted-foreground">Pending Approval</div>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-red-600">3</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Reviews</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Approve All</Button>
                <Button size="sm" variant="outline">Bulk Actions</Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-start p-4 border rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-medium">John Smith</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    "Great service and friendly staff. Highly recommend for dental care."
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Kedron Family Dental • 2 hours ago
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <XCircle className="h-4 w-4" />
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