import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Star, Mail } from "lucide-react";

export function ExportManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Export & Backup</CardTitle>
          <CardDescription>Export data, create backups, and manage data integrity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4" id="quick-exports-title">Quick Exports</h3>
              <div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                role="group"
                aria-labelledby="quick-exports-title"
              >
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  aria-label="Export all business data to CSV file"
                >
                  <Building2 className="h-6 w-6 mb-2" aria-hidden="true" />
                  Export All Businesses
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  aria-label="Export all user data to CSV file"
                >
                  <Users className="h-6 w-6 mb-2" aria-hidden="true" />
                  Export All Users
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  aria-label="Export all review data to CSV file"
                >
                  <Star className="h-6 w-6 mb-2" aria-hidden="true" />
                  Export All Reviews
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  aria-label="Export all lead data to CSV file"
                >
                  <Mail className="h-6 w-6 mb-2" aria-hidden="true" />
                  Export All Leads
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Default export compatibility layer
export default ExportManagement;