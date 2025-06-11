import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export default function OwnershipManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ownership Claims Management</CardTitle>
          <CardDescription>Review and manage business ownership claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pending Claims</h3>
              <Badge variant="secondary">0 pending</Badge>
            </div>
            
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending ownership claims at this time</p>
              <p className="text-sm">Claims will appear here when users request business ownership</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}