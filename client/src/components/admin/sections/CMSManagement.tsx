import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit } from "lucide-react";

export default function CMSManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Management System</CardTitle>
          <CardDescription>Manage pages, content, and website structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pages</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Page
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="flex justify-between items-center p-4 border rounded">
                <div>
                  <h4 className="font-semibold">About Us</h4>
                  <p className="text-sm text-muted-foreground">Company information and mission</p>
                  <div className="text-xs text-muted-foreground mt-1">Last updated: 2 days ago</div>
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
                  <h4 className="font-semibold">Contact</h4>
                  <p className="text-sm text-muted-foreground">Contact information and form</p>
                  <div className="text-xs text-muted-foreground mt-1">Last updated: 1 week ago</div>
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