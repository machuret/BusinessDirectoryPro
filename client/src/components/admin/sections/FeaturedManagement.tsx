import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, XCircle } from "lucide-react";

export default function FeaturedManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Featured Listings Management</CardTitle>
          <CardDescription>Manage which businesses appear as featured on the homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Currently Featured</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Add Featured</Button>
                <Button size="sm" variant="outline">Bulk Edit</Button>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Featured Since</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">Kedron Family Dental</div>
                        <div className="text-sm text-muted-foreground">Professional dental care</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Dentist</Badge>
                    </TableCell>
                    <TableCell>Kedron, QLD</TableCell>
                    <TableCell>2 weeks ago</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">Brisbane Eye Centre</div>
                        <div className="text-sm text-muted-foreground">Complete eye care solutions</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Eye Care</Badge>
                    </TableCell>
                    <TableCell>Brisbane, QLD</TableCell>
                    <TableCell>1 week ago</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Add New Featured Business</h3>
              <div className="flex gap-2">
                <Input placeholder="Search businesses to feature..." className="flex-1" />
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Featured
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}