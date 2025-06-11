import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function LeadsManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leads Management</CardTitle>
          <CardDescription>Manage customer inquiries and business leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-blue-600">42</div>
                <div className="text-sm text-muted-foreground">New Leads</div>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-yellow-600">18</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-green-600">134</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl font-bold text-red-600">12</div>
                <div className="text-sm text-muted-foreground">Lost</div>
              </div>
            </div>
            
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent leads</p>
              <p className="text-sm">Customer inquiries will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}