import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Search, Trash2 } from "lucide-react";

export default function CitiesManagement() {
  const { toast } = useToast();
  const [showAddCityDialog, setShowAddCityDialog] = useState(false);
  const [editingCity, setEditingCity] = useState<{ city: string; count: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCity, setNewCity] = useState({
    city: "",
    description: ""
  });
  const [editCityData, setEditCityData] = useState({
    newName: "",
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
      setNewCity({ city: "", description: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateCityMutation = useMutation({
    mutationFn: async ({ oldName, newName, description }: { oldName: string; newName: string; description: string }) => {
      const res = await apiRequest("PATCH", "/api/admin/cities/update", { oldName, newName, description });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({ title: "Success", description: "City updated successfully" });
      setEditingCity(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteCityMutation = useMutation({
    mutationFn: async (cityName: string) => {
      await apiRequest("DELETE", `/api/admin/cities/${encodeURIComponent(cityName)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({ title: "Success", description: "City deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleEditCity = (city: { city: string; count: number }) => {
    setEditingCity(city);
    setEditCityData({
      newName: city.city,
      description: ""
    });
  };

  const handleEditSubmit = () => {
    if (editingCity && editCityData.newName) {
      updateCityMutation.mutate({
        oldName: editingCity.city,
        newName: editCityData.newName,
        description: editCityData.description
      });
    }
  };

  const filteredCities = cities?.filter(city =>
    city.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cities Management</CardTitle>
          <CardDescription>Manage city names, merge duplicates, and organize locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
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
                  {filteredCities?.map((city) => (
                    <TableRow key={city.city}>
                      <TableCell className="font-medium">{city.city}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{city.count} businesses</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditCity(city)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteCityMutation.mutate(city.city)}
                            disabled={deleteCityMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
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
                value={newCity.city}
                onChange={(e) => setNewCity({...newCity, city: e.target.value})}
                placeholder="City name"
              />
            </div>
            <div>
              <Label htmlFor="cityDescription">Description (Optional)</Label>
              <Textarea
                id="cityDescription"
                value={newCity.description}
                onChange={(e) => setNewCity({...newCity, description: e.target.value})}
                placeholder="City description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCityDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createCityMutation.mutate(newCity)}
              disabled={createCityMutation.isPending || !newCity.city}
            >
              {createCityMutation.isPending ? "Adding..." : "Add City"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit City Dialog */}
      <Dialog open={!!editingCity} onOpenChange={() => setEditingCity(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit City</DialogTitle>
            <DialogDescription>Update city information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCityName">City Name (Read-only)</Label>
              <Input
                id="editCityName"
                value={editingCity?.city || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="editCityTitle">Page Title</Label>
              <Input
                id="editCityTitle"
                value={editCityData.newName}
                onChange={(e) => setEditCityData({...editCityData, newName: e.target.value})}
                placeholder="Page title for this city"
              />
            </div>
            <div>
              <Label htmlFor="editCityDescription">Description (Optional)</Label>
              <Textarea
                id="editCityDescription"
                value={editCityData.description}
                onChange={(e) => setEditCityData({...editCityData, description: e.target.value})}
                placeholder="City description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCity(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={updateCityMutation.isPending || !editCityData.newName}
            >
              {updateCityMutation.isPending ? "Updating..." : "Update City"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}