import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit } from "lucide-react";

export default function CitiesManagement() {
  const { toast } = useToast();
  const [showAddCityDialog, setShowAddCityDialog] = useState(false);
  const [newCity, setNewCity] = useState({
    name: "",
    description: ""
  });

  const { data: cities } = useQuery<{ city: string; count: number }[]>({
    queryKey: ["/api/cities"],
  });

  const createCityMutation = useMutation({
    mutationFn: async (cityData: typeof newCity) => {
      const res = await apiRequest("POST", "/api/admin/cities", cityData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({ title: "Success", description: "City added successfully" });
      setShowAddCityDialog(false);
      setNewCity({ name: "", description: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
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
              <Button onClick={() => setShowAddCityDialog(true)}>
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

      {/* Add City Dialog */}
      <Dialog open={showAddCityDialog} onOpenChange={setShowAddCityDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New City</DialogTitle>
            <DialogDescription>Add a new city to the directory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cityName">City Name</Label>
              <Input
                id="cityName"
                value={newCity.name}
                onChange={(e) => setNewCity({...newCity, name: e.target.value})}
                placeholder="City name"
              />
            </div>
            <div>
              <Label htmlFor="cityDescription">Description (Optional)</Label>
              <Input
                id="cityDescription"
                value={newCity.description}
                onChange={(e) => setNewCity({...newCity, description: e.target.value})}
                placeholder="City description"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowAddCityDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createCityMutation.mutate(newCity)}
              disabled={createCityMutation.isPending || !newCity.name}
            >
              {createCityMutation.isPending ? "Adding..." : "Add City"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}