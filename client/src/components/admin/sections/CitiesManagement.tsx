import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit } from "lucide-react";

export default function CitiesManagement() {
  const { data: cities } = useQuery<{ city: string; count: number }[]>({
    queryKey: ["/api/cities"],
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cities Management</CardTitle>
          <CardDescription>Manage city names, merge duplicates, and organize locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Cities</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add City
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City Name</TableHead>
                    <TableHead>Business Count</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cities?.map((city) => (
                    <TableRow key={city.city}>
                      <TableCell className="font-medium">{city.city}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{city.count} businesses</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}