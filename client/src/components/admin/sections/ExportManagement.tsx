import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Star, Mail } from "lucide-react";

export default function ExportManagement() {
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
              <h3 className="text-lg font-semibold mb-4">Quick Exports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Building2 className="h-6 w-6 mb-2" />
                  Export All Businesses
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Export All Users
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Star className="h-6 w-6 mb-2" />
                  Export All Reviews
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Mail className="h-6 w-6 mb-2" />
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